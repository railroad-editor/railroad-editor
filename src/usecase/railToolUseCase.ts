import {action} from "mobx";
import {LayoutStore} from "../store/layoutStore";
import {getCloseJointsOf, intersectsOf} from "../containers/rails/utils";
import {BuilderStore} from "../store/builderStore";
import {FeederUseCase} from "./feederUseCase";
import {JointPair} from "../containers/hoc/withBuilder";
import {GapJoinerUseCase} from "./gapJoinerUseCase";
import {SelectionToolUseCase} from "./selectionToolUseCase";
import {Tools} from "../constants/tools";
import {SwitcherUseCase} from "./switcherUseCase";


export class RailToolUseCase {

  private readonly layoutStore: LayoutStore
  private readonly builderStore: BuilderStore
  private readonly feederUseCase: FeederUseCase
  private readonly gapJoinerUseCase: GapJoinerUseCase
  private readonly switcherUseCase: SwitcherUseCase
  private readonly selectionToolUseCase: SelectionToolUseCase

  constructor(
    layoutStore: LayoutStore,
    builderStore: BuilderStore,
    feederUseCase: FeederUseCase,
    gapJoinerUseCase: GapJoinerUseCase,
    switcherUseCase: SwitcherUseCase,
    selectionToolUseCase: SelectionToolUseCase
  ) {
    this.layoutStore = layoutStore
    this.builderStore = builderStore
    this.feederUseCase = feederUseCase
    this.gapJoinerUseCase = gapJoinerUseCase
    this.switcherUseCase = switcherUseCase
    this.selectionToolUseCase = selectionToolUseCase
  }

  /**
   * レールを削除する。接続されているフィーダー、ギャップジョイナーも削除する。
   */
  @action
  deleteRail = (railId: number) => {
    // フィーダーを削除
    this.layoutStore.currentLayoutData.feeders
      .filter(feeder => feeder.railId === railId)
      .forEach(feeder => this.feederUseCase.deleteFeeder(feeder.id))
    // ジョイントを解除
    this.disconnectJoint(railId)
    // Switcherに接続されていたら削除
    this.switcherUseCase.disconnectTurnoutFromSwitcher(railId)
    this.layoutStore.deleteRail({id: railId})
  }

  @action
  deleteRails = (railIds: number[]) => {
    railIds.forEach(id => this.deleteRail(id))
  }

  @action
  checkIntersections() {
    const {temporaryRails} = this.builderStore
    const {currentLayoutData, activeLayerRails} = this.layoutStore

    const jointsCloseToTempRail = _.flatMap(temporaryRails, r => getCloseJointsOf(r.id, currentLayoutData.rails))
    // const closeJointPairForTempRail = this.props.layout.unconnectedCloseJoints.filter(ji => ji.from.railId === -1)
    const targetRailIds = _.without(activeLayerRails.map(rail => rail.id), ...jointsCloseToTempRail.map(j => j.to.railId))
    const intersects = temporaryRails.map(r => intersectsOf(r.id, targetRailIds)).some(e => e)
    this.builderStore.setIntersects(intersects)
  }

  @action
  connectJoint = (pair: JointPair) => {
    this.layoutStore.updateRail({
      id: pair.from.railId,
      opposingJoints: {
        [pair.from.jointId]: pair.to
      }
    })
    this.layoutStore.updateRail({
      id: pair.to.railId,
      opposingJoints: {
        [pair.to.jointId]: pair.from
      }
    })
  }

  /**
   * 複数のジョイントを接続する。
   */
  @action
  connectJoints = (pairs: JointPair[]) => {
    pairs.forEach(pair => this.connectJoint(pair))
  }

  @action
  connectUnconnectedCloseJoints = () => {
    this.connectJoints(this.layoutStore.unconnectedCloseJoints)
  }

  /**
   * 指定のレールのジョイントの接続を解除する。
   */
  @action
  disconnectJoint = (railId: number) => {
    const target = this.layoutStore.getRailDataById(railId)
    if (target == null) {
      return
    }

    // ギャップジョイナーを削除
    this.gapJoinerUseCase.disconnectGapJoiner(railId)

    // 指定のレールに接続されている全てのレールのジョイントを開放
    const updatedData = _.values(target.opposingJoints).map(joint => {
      return {
        id: joint.railId,
        opposingJoints: {
          [joint.jointId]: null
        }
      }
    })

    // 指定のレールのジョイントを全て開放
    updatedData.push({
      id: railId,
      opposingJoints: null
    })

    this.layoutStore.updateRails(updatedData)
  }

  @action
  disconnectJoints = (railIds: number[]) => {
    railIds.forEach(id => this.disconnectJoint(id))
  }


  @action
  deleteSelectedRails = () => {
    this.deleteRails(this.layoutStore.selectedRails.map(rail => rail.id))
  }


  @action
  deleteSelected = () => {
    switch (this.builderStore.activeTool) {
      case Tools.FEEDERS:
        this.feederUseCase.deleteSelectedFeeders()
        break
      case Tools.GAP_JOINERS:
        this.gapJoinerUseCase.deleteSelectedGapJoiners()
        break
      default:
        this.deleteSelectedRails()
        break
    }
  }
}