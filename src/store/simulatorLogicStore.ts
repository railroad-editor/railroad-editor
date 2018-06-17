import {action, comparer, observable, reaction} from "mobx";
import getLogger from "logging";
import layoutStore, {PowerPackData} from "store/layoutStore";
import {getRailComponent} from "components/rails/utils";
import {FlowDirection, Pivot} from "components/rails/parts/primitives/PartBase";
import commonStore from "./commonStore";
import {EditorMode} from "store/uiStore";
import {deepEqual} from "deep-equal";
import {shallowEqual} from "recompose";

const LOGGER = getLogger(__filename)


export interface TemporaryFlowDirection {
  feederId: number
  direction: FlowDirection
}

export interface TemporaryRailPartFlows {
  [partId: number]: TemporaryFlowDirection[]
}

export interface TemporaryRailFlows {
  [railId: number]: TemporaryRailPartFlows
}



export class SimulatorLogicStore {

  @observable temporaryRailFlows: TemporaryRailFlows

  constructor() {
    reaction(() => commonStore.editorMode,
      (mode) => {
        if (mode === EditorMode.SIMULATOR) {
          this.startCurrentFlowSimulation(layoutStore.currentLayoutData.powerPacks)
        } else {
          this.stopCurrentFlowSimulation()
        }
      }
    )
    reaction(
      () => layoutStore.currentLayoutData.powerPacks.map( p => p.power * (p.direction ? 1 : -1)),
      (data) => {
        if (commonStore.editorMode === EditorMode.SIMULATOR) {
          this.startCurrentFlowSimulation(layoutStore.currentLayoutData.powerPacks)
        }
      },
    )
    reaction(
      () => layoutStore.currentLayoutData.powerPacks.map( p => p.supplyingFeederIds),
      (data) => {
        if (commonStore.editorMode === EditorMode.SIMULATOR) {
          this.startCurrentFlowSimulation(layoutStore.currentLayoutData.powerPacks)
        }
      },
    )
  }

  // shouldUpdateSimulation = (value: PowerPackData[], nextValue: PowerPackData[]) => {
  //   if (value.length !== nextValue.length) {
  //     return true
  //   }
  //   LOGGER.info(value[0], nextValue[0])
  //   for (let i=0 ; i < value.length ; ++i) {
  //     if (value[i].direction !== nextValue[i].direction
  //       || value[i].power !== nextValue[i].power) {
  //       return true
  //     }
  //   }
  //   return false
  //   // return deepEqual(value, nextValue)
  // }

  /**
   * 全てのフィーダーに通電し、レール電流のシミュレーションを開始する
   */
  @action
  startCurrentFlowSimulation = (powerPacks: PowerPackData[]) => {
    LOGGER.info('Simulation start.')
    this.initializeCurrentFlows()

    // 各フィーダーの電流を仮シミュレートする
    layoutStore.currentLayoutData.feeders.forEach(feeder =>
      this.simulateFeederCurrentFlow(feeder.id, powerPacks))

    LOGGER.info(this.temporaryRailFlows)

    // 仮シミュレートの結果をもとに全レールの最終的な電流を決定する
    _.keys(this.temporaryRailFlows).forEach(railId => {
      _.keys(this.temporaryRailFlows[railId]).forEach(partId => {
        this.setFlow(Number(railId), Number(partId), this.temporaryRailFlows[railId][partId])
      })
    })
  }

  /**
   * レール電流のシミュレーションを終了する
   */
  @action
  stopCurrentFlowSimulation = () => {
    this.initializeCurrentFlows()
  }


  initializeCurrentFlows = () => {
    this.temporaryRailFlows = {}
    layoutStore.updateRails(layoutStore.currentLayoutData.rails.map(r => {
      return {
        id: r.id,
        flowDirections: null  // reset
      }
    }))
  }


  toggleFeederDirection = (direction: FlowDirection) => {
    switch (direction) {
      case FlowDirection.RIGHT_TO_LEFT:
        return FlowDirection.LEFT_TO_RIGHT
      case FlowDirection.LEFT_TO_RIGHT:
        return FlowDirection.RIGHT_TO_LEFT
    }
    return direction
  }

  simulateFeederCurrentFlow = (feederId: number, powerPacks: PowerPackData[]) => {
    // パワーパックに接続されてないか、電流が0なら何もしない
    const powerPack = powerPacks.find(p => p.supplyingFeederIds.includes(feederId))
    if (!powerPack || powerPack.power === 0) {
      return
    }

    const feeder = layoutStore.getFeederDataById(feederId)
    const rail = layoutStore.getRailDataById(feeder.railId)
    const joints = getRailComponent(rail.id).railPart.joints
    const feederSockets = getRailComponent(rail.id).railPart.feederSockets
    const feederedPartId = feederSockets[feeder.socketId].pivotPartIndex
    const flowDirection = powerPack.direction ? feeder.direction : this.toggleFeederDirection(feeder.direction)

    // フィーダーが接続されているパーツの電流を設定
    const isAlreadySet = this.setTemporaryFlow(feeder.railId, feederedPartId, feederId, flowDirection)
    if (isAlreadySet) {
      return
    }

    // このパーツに接続されているジョイントの先のレールに流を設定
    _.range(joints.length).forEach(jointId => {
      // 対向ジョイントが無ければ終了
      const opposingJoint = rail.opposingJoints[jointId]
      if (!opposingJoint) {
        return
      }
      // このジョイントか、対向ジョイントがギャップジョイナーなら終了
      if (this.isGapJoiner(feeder.railId, jointId) || this.isGapJoiner(opposingJoint.railId, opposingJoint.jointId)) {
        return
      }

      const joint = joints[jointId]
      const isGoing = this.isCurrentGoing(joint.pivot, feeder.direction)
      this.setCurrentFlowToRail(opposingJoint.railId, opposingJoint.jointId, feederId, isGoing)
    })
  }

  isGapJoiner = (railId: number, jointId: number) => {
    const gapJoiner = layoutStore.currentLayoutData.gapJoiners.find(gj =>
      gj.railId === railId && gj.jointId === jointId)
    return !!gapJoiner
  }


  setCurrentFlowToRail = (railId: number, jointId: number, feederId: number, isComing: boolean) => {
    const rail = layoutStore.getRailDataById(railId)
    const railPart = getRailComponent(railId).railPart
    const joint = railPart.joints[jointId]
    const partId = joint.pivotPartIndex
    // パーツが通電可能であるかを確認
    if (!railPart.conductiveParts.includes(partId)) {
      return
    }

    const direction = this.getDirection(joint.pivot, isComing)
    const isAlreadySet = this.setTemporaryFlow(railId, partId, feederId, direction)
    // 既にこのフィーダーで電流がセット済みなら終了
    if (isAlreadySet) {
      return
    }

    // もう一方のジョイントがあれば、他のレールに接続されているか確認する
    const anotherJointId = railPart.joints.findIndex(j=> j.pivotPartIndex === partId && j.pivot !== joint.pivot)
    const anotherJoint = railPart.joints[anotherJointId]
    const opposingJoint = rail.opposingJoints[anotherJointId]
    // 接続されていなければ終了
    if (!opposingJoint) {
      return
    }

    const isGoing = this.isCurrentGoing(anotherJoint.pivot, direction)
    // 再帰的に電流をセットする
    this.setCurrentFlowToRail(opposingJoint.railId, opposingJoint.jointId, feederId, isGoing)
  }


  getDirection = (pivot: Pivot, isComing: boolean) => {
    const MAP = {
      [Pivot.LEFT]: isComing ? FlowDirection.LEFT_TO_RIGHT : FlowDirection.RIGHT_TO_LEFT,
      [Pivot.RIGHT]: isComing ? FlowDirection.RIGHT_TO_LEFT : FlowDirection.LEFT_TO_RIGHT
    }
    return MAP[pivot]
  }


  isCurrentGoing = (pivot: Pivot, direction: FlowDirection) => {
    const MAP = {
      [Pivot.LEFT]: {
        [FlowDirection.LEFT_TO_RIGHT]: false,
        [FlowDirection.RIGHT_TO_LEFT]: true,
      },
      [Pivot.RIGHT]: {
        [FlowDirection.LEFT_TO_RIGHT]: true,
        [FlowDirection.RIGHT_TO_LEFT]: false,
      },
    }
    return MAP[pivot][direction]
  }


  setTemporaryFlow = (railId: number, partId: number, feederId: number, direction: FlowDirection) => {

    if (!this.temporaryRailFlows[railId]) {
      this.temporaryRailFlows[railId] = {}
    }
    if (!this.temporaryRailFlows[railId][partId]) {
      this.temporaryRailFlows[railId][partId] = []
    }

    const alreadySet = this.temporaryRailFlows[railId][partId].find(tempDir => tempDir.feederId === feederId)
    if (alreadySet) {
      return true
    }

    this.temporaryRailFlows[railId][partId].push({feederId: feederId, direction: direction})
    return false
  }


  setFlow = (railId: number, partId: number, tempFlows: TemporaryFlowDirection[]) => {
    let direction = FlowDirection.NONE
    const directions = tempFlows.map(tf => tf.direction)
    const l2r = directions.find(d => d === FlowDirection.LEFT_TO_RIGHT)
    const r2l = directions.find(d => d === FlowDirection.RIGHT_TO_LEFT)
    if (l2r && r2l) {
      direction = FlowDirection.ILLEGAL
    } else if (l2r) {
      direction = FlowDirection.LEFT_TO_RIGHT
    } else if (r2l) {
      direction = FlowDirection.RIGHT_TO_LEFT
    }

    layoutStore.updateRail({
      id: railId,
      flowDirections: {
        [partId]: direction
      }
    })
  }
}

export default new SimulatorLogicStore()
