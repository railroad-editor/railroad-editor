import {action} from "mobx";
import getLogger from "logging";
import layoutStore from "store/layoutStore";
import {getRailComponent} from "components/rails/utils";
import {FlowDirection, Pivot} from "components/rails/parts/primitives/PartBase";

const LOGGER = getLogger(__filename)


export class SimulatorLogicStore {

  constructor() {
  }

  @action
  setCurrentFlowToFeeder = (feederId: number) => {
    const feeder = layoutStore.getFeederDataById(feederId)
    const rail = layoutStore.getRailDataById(feeder.railId)
    const joints = getRailComponent(rail.id).railPart.joints
    const feederSockets = getRailComponent(rail.id).railPart.feederSockets
    const feederedPartId = feederSockets[feeder.socketId].pivotPartIndex

    // フィーダーが接続されているパーツの電流を設定
    const isAlreadySet = this.setFlow(feeder.railId, feederedPartId, feeder.direction)
    if (isAlreadySet) {
      return
    }

    // このパーツに接続されているジョイントの先のレールに電流を設定
    _.range(joints.length).forEach(jointId => {
      const opposingJoint = rail.opposingJoints[jointId]
      if (!opposingJoint) {
        return
      }
      const joint = joints[jointId]
      const isGoing = this.isCurrentGoing(joint.pivot, feeder.direction)
      this.setCurrentFlowToRail(opposingJoint.railId, opposingJoint.jointId, isGoing)
    })
  }


  @action
  setCurrentFlowToRail = (railId: number, jointId: number, isComing: boolean) => {
    const rail = layoutStore.getRailDataById(railId)
    const railPart = getRailComponent(railId).railPart
    const joint = railPart.joints[jointId]
    const partId = joint.pivotPartIndex
    const direction = this.getDirection(joint.pivot, isComing)

    const isAlreadySet = this.setFlow(railId, partId, direction)
    if (isAlreadySet) {
      return
    }

    const anotherJointId = railPart.joints.findIndex(j=> j.pivotPartIndex === partId && j.pivot !== joint.pivot)
    const anotherJoint = railPart.joints[anotherJointId]
    const opposingJoint = rail.opposingJoints[anotherJointId]
    if (!opposingJoint) {
      return
    }
    const isGoing = this.isCurrentGoing(anotherJoint.pivot, direction)
    this.setCurrentFlowToRail(opposingJoint.railId, opposingJoint.jointId, isGoing)
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


  @action
  setFlow = (railId: number, partId: number, direction: FlowDirection) => {
    const rail = layoutStore.getRailDataById(railId)
    if (rail.flowDirections[partId]) {
      return true
    }
    layoutStore.updateRail({
      id: railId,
      flowDirections: {
        [partId]: direction
      }
    })
    return false
  }
}

export default new SimulatorLogicStore()
