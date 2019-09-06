import {action, comparer, observable, reaction} from "mobx";
import getLogger from "logging";
import layoutStore, {PowerPackData} from "store/layoutStore";
import {getRailComponent} from "components/rails/utils";
import commonStore from "./commonStore";
import {EditorMode} from "store/uiStore";
import {Tools} from "constants/tools";
import {FlowDirection, Pivot} from "react-rail-components/lib/parts/primitives/PartBase";

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

  @observable activeTool: Tools
  @observable temporaryRailFlows: TemporaryRailFlows
  errorPowerPacks: PowerPackData[]
  errorRails: any[]

  constructor() {
    // シミュレーション更新タイミング
    // 1. 電流のON/OFFまたは向きの変更時
    // 2. パワーパックの接続先フィーダーの変更時
    reaction(
      () => {
        return {
          powers: layoutStore.currentLayoutData.powerPacks.map(p => (p.power > 0 ? 1 : 0) * (p.direction ? 1 : -1)),
          feederIds: layoutStore.currentLayoutData.powerPacks.map(p => p.supplyingFeederIds),
        }
      },
      (data) => {
        if (commonStore.editorMode === EditorMode.SIMULATOR) {
          this.startCurrentFlowSimulation()
        }
      },
      // Deep Equal を利用
      {
        equals: comparer.structural
      }
    )
    // 3. スイッチの接続先の導電状態の変更時
    reaction(
      () => _.flatMap(layoutStore.currentLayoutData.switchers, sw => sw.conductionStates),
      () => {
        if (commonStore.editorMode === EditorMode.SIMULATOR) {
          this.startCurrentFlowSimulation()
        }
      }
    )

    this.errorRails = []
    this.errorPowerPacks = []
  }

  /**
   * 全てのフィーダーに通電し、レール電流のシミュレーションを開始する
   */
  @action
  startCurrentFlowSimulation = () => {
    LOGGER.info('Simulation start.')
    this.initializeCurrentFlows()

    // 各フィーダーの電流を仮シミュレートする
    layoutStore.currentLayoutData.feeders.forEach(feeder =>
      this.simulateFeederCurrentFlow(feeder.id, layoutStore.currentLayoutData.powerPacks))

    LOGGER.info(this.temporaryRailFlows)

    // 仮シミュレートの結果をもとに全レールの最終的な電流を決定する
    _.keys(this.temporaryRailFlows).forEach(railId => {
      _.keys(this.temporaryRailFlows[railId]).forEach(partId => {
        this.setFlow(Number(railId), Number(partId), this.temporaryRailFlows[railId][partId])
      })
    })

    layoutStore.updateRails(this.errorRails.map(r => {
      return {
        id: r.id,
        flowDirections: {
          [r.partId]: FlowDirection.ILLEGAL
        }
      }
    }))
    layoutStore.updatePowerPacks(this.errorPowerPacks.map(p => {
      return {id: p.id, power: 0, isError: true}
    }))
  }

  /**
   * レール電流のシミュレーションを終了する
   */
  @action
  stopCurrentFlowSimulation = () => {
    this.initializeCurrentFlows()
  }


  private initializeCurrentFlows = () => {
    this.temporaryRailFlows = {}
    layoutStore.updateRails(layoutStore.currentLayoutData.rails.map(r => {
      return {
        id: r.id,
        flowDirections: null  // reset
      }
    }))
    layoutStore.updatePowerPacks(layoutStore.currentLayoutData.powerPacks.map(p => {
      return {
        id: p.id,
        isError: false
      }
    }))
    this.errorPowerPacks = []
  }


  private simulateFeederCurrentFlow = (feederId: number, powerPacks: PowerPackData[]) => {
    // パワーパックに接続されてないか、電流が0なら何もしない
    const powerPack = powerPacks.find(p => p.supplyingFeederIds.includes(feederId))
    if (! powerPack || powerPack.power === 0) {
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
      if (! opposingJoint) {
        return
      }
      // このジョイントか、対向ジョイントがギャップジョイナーなら終了
      if (this.isGapJoiner(feeder.railId, jointId) || this.isGapJoiner(opposingJoint.railId, opposingJoint.jointId)) {
        return
      }

      // 再帰的に処理する
      const joint = joints[jointId]
      const isGoing = this.isCurrentGoing(joint.pivot, flowDirection)
      this.setCurrentFlowToRail(opposingJoint.railId, opposingJoint.jointId, feederId, isGoing)
    })
  }


  private toggleFeederDirection = (direction: FlowDirection) => {
    switch (direction) {
      case FlowDirection.RIGHT_TO_LEFT:
        return FlowDirection.LEFT_TO_RIGHT
      case FlowDirection.LEFT_TO_RIGHT:
        return FlowDirection.RIGHT_TO_LEFT
    }
    return direction
  }


  private isGapJoiner = (railId: number, jointId: number) => {
    const gapJoiner = layoutStore.currentLayoutData.gapJoiners.find(gj =>
      gj.railId === railId && gj.jointId === jointId)
    return !! gapJoiner
  }


  private setCurrentFlowToRail = (railId: number, jointId: number, feederId: number, isComing: boolean) => {
    const rail = layoutStore.getRailDataById(railId)
    const railPart = getRailComponent(railId).railPart
    const joint = railPart.joints[jointId]
    const partId = joint.pivotPartIndex
    // パーツが通電可能であるかを確認
    if (! railPart.conductiveParts.includes(partId)) {
      return
    }

    const direction = this.getDirection(joint.pivot, isComing)
    const isAlreadySet = this.setTemporaryFlow(railId, partId, feederId, direction)
    // 既にこのフィーダーで電流がセット済みなら終了
    if (isAlreadySet) {
      return
    }

    // もう一方のジョイントがあれば、他のレールに接続されているか確認する
    const anotherJointId = railPart.joints.findIndex(j => j.pivotPartIndex === partId && j.pivot !== joint.pivot)
    const anotherJoint = railPart.joints[anotherJointId]
    const opposingJoint = rail.opposingJoints[anotherJointId]
    // 接続されていなければ終了
    if (! opposingJoint) {
      return
    }

    const isGoing = this.isCurrentGoing(anotherJoint.pivot, direction)
    // 再帰的に電流をセットする
    this.setCurrentFlowToRail(opposingJoint.railId, opposingJoint.jointId, feederId, isGoing)
  }


  private getDirection = (pivot: Pivot, isComing: boolean) => {
    const MAP = {
      [Pivot.LEFT]: isComing ? FlowDirection.LEFT_TO_RIGHT : FlowDirection.RIGHT_TO_LEFT,
      [Pivot.RIGHT]: isComing ? FlowDirection.RIGHT_TO_LEFT : FlowDirection.LEFT_TO_RIGHT
    }
    return MAP[pivot]
  }


  private isCurrentGoing = (pivot: Pivot, direction: FlowDirection) => {
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


  private setTemporaryFlow = (railId: number, partId: number, feederId: number, direction: FlowDirection) => {

    if (! this.temporaryRailFlows[railId]) {
      this.temporaryRailFlows[railId] = {}
    }
    if (! this.temporaryRailFlows[railId][partId]) {
      this.temporaryRailFlows[railId][partId] = []
    }

    const alreadySet = this.temporaryRailFlows[railId][partId].find(tempDir => tempDir.feederId === feederId)
    if (alreadySet) {
      return true
    }

    this.temporaryRailFlows[railId][partId].push({feederId: feederId, direction: direction})
    return false
  }


  private setFlow = (railId: number, partId: number, tempFlows: TemporaryFlowDirection[]) => {
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

    if (direction === FlowDirection.ILLEGAL) {
      this.errorRails.push({id: railId, partId: partId})
      const errorPowerPacks = tempFlows.map(tf => tf.feederId)
        .map(fid => layoutStore.getPowerPackByFeederId(fid))
      this.errorPowerPacks = _.unionWith(this.errorPowerPacks, errorPowerPacks, (p1, p2) => p1.id === p2.id)
    } else {
      _.remove(this.errorRails, r => _.isEqual(r, {id: railId, partId: partId}))
    }
  }
}

export default new SimulatorLogicStore()
