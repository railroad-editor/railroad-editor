import {action} from "mobx";
import getLogger from "logging";
import layoutStore, {ConductionStates} from "store/layoutStore";
import builderStore, {PlacingMode} from "store/builderStore";
import {JointPair} from "components/hoc/withBuilder";
import {Tools} from "constants/tools";
import {getRailComponent} from "components/rails/utils";
import commonStore from "./commonStore";
import StorageAPI from "apis/storage"
import LayoutAPI from "apis/layout";
import * as moment from "moment";
import simulatorLogicStore from "store/simulatorLogicStore";
import {EditorMode} from "store/uiStore";
import {FlowDirection, Pivot} from "react-rail-components/lib/parts/primitives/PartBase";

const LOGGER = getLogger(__filename)


/**
 * LayoutStoreが肥大化しすぎるのを防ぐため、
 * LayoutStoreには単純なCRUDに当たるメソッドだけを定義し、
 * ロジックをこのStoreに集中させた。
 */
export class LayoutLogicStore {

  constructor() {
  }

  /**
   * レイアウト Save/Load
   */
  @action
  saveLayout = async () => {

    const userId = commonStore.userInfo.id
    // メタデータを更新
    layoutStore.setLayoutMeta({
      ...layoutStore.meta,
      lastModified: moment().valueOf()
    })
    // レイアウトデータをセーブ
    LayoutAPI.saveLayoutData(
      commonStore.currentUser,
      layoutStore.currentLayoutData,
      layoutStore.meta,
      layoutStore.config,
      builderStore.userRailGroups,
      builderStore.userRails
    )
    // レイアウト画像をセーブ
    await StorageAPI.saveCurrentLayoutImage(userId, layoutStore.meta.id)
    // 背景画像が設定されていたらセーブ
    if (layoutStore.config.backgroundImageUrl) {
      await StorageAPI.saveBackgroundImage(userId, layoutStore.meta.id, layoutStore.config.backgroundImageUrl)
    }

    await commonStore.loadLayoutList()
  }

  @action
  loadLayout = async (layoutId: string) => {
    const layout = await LayoutAPI.fetchLayoutData(commonStore.currentUser, layoutId)
    layoutStore.setLayoutData(layout.layout)
    layoutStore.setLayoutMeta(layout.meta)
    layoutStore.setConfig(layout.config)
    builderStore.setUserRailGroups(layout.userRailGroups)
    builderStore.setUserRails(layout.userRails)
    if (layout.layout.rails.length > 0) {
      builderStore.setPlacingMode(PlacingMode.JOINT)
    } else {
      builderStore.setPlacingMode(PlacingMode.FREE)
    }

    // TODO: 本当はセーブするときに全ての電流をOFFにしておくのが良い
    if (commonStore.editorMode === EditorMode.BUILDER) {
      simulatorLogicStore.stopCurrentFlowSimulation()
    }
  }

  /**
   * フィーダーを削除する。
   * @param {number} feederId
   */
  @action
  deleteFeeder = (feederId: number) => {
    this.disconnectFeederFromPowerPack(feederId)
    layoutStore.deleteFeeder({id: feederId})
  }

  /**
   * レールを削除する。接続されているフィーダー、ギャップジョイナーも削除する。
   */
  @action
  deleteRail = (railId: number) => {
    // フィーダーを削除
    layoutStore.currentLayoutData.feeders
      .filter(feeder => feeder.railId === railId)
      .forEach(feeder => this.deleteFeeder(feeder.id))
    // ジョイントを解除
    this.disconnectJoint(railId)
    // Switcherに接続されていたら削除
    this.disconnectTurnoutFromSwitcher(railId)
    layoutStore.deleteRail({id: railId})
  }

  /**
   * 複数のレールを削除する。
   */
  @action
  deleteRails = (railIds: number[]) => {
    railIds.forEach(id => this.deleteRail(id))
  }

  /**
   * レイヤーを削除する。レイヤー上のレールも全て削除する。
   * TODO: deleteRailsを使わないのはなんで？
   */
  @action
  deleteLayer = (layerId: number) => {
    // レイヤー上のレールを全て接続解除してから削除する
    const layerRailIds = layoutStore.currentLayoutData.rails
      .filter(rail => rail.layerId === layerId)
      .map(rail => rail.id)
    this.disconnectJoints(layerRailIds)
    layoutStore.deleteLayer({id: layerId})

    // アクティブレイヤーを消した場合
    if (builderStore.activeLayerId === layerId) {
      const restLayerIds = layoutStore.currentLayoutData.layers
        .filter(layer => layer.id !== layerId)
        .map(layer => layer.id)
      builderStore.setActiveLayer(restLayerIds[0])
    }
  }

  /**
   * ２レール間のジョイントを接続する。
   */
  @action
  connectJoint = (pair: JointPair) => {
    layoutStore.updateRail({
      id: pair.from.railId,
      opposingJoints: {
        [pair.from.jointId]: pair.to
      }
    })
    layoutStore.updateRail({
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
    this.connectJoints(layoutStore.unconnectedCloseJoints)
  }

  /**
   * 指定のレールのジョイントの接続を解除する。
   */
  @action
  disconnectJoint = (railId: number) => {
    const target = this.getRailDataById(railId)
    if (target == null) {
      return
    }

    // ギャップジョイナーを削除
    this.disconnectGapJoiner(railId)

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

    layoutStore.updateRails(updatedData)
  }

  /**
   * disocnnectJointのバルク版
   */
  @action
  disconnectJoints = (railIds: number[]) => {
    railIds.forEach(id => this.disconnectJoint(id))
  }

  /**
   * ギャップジョイナーを削除する
   */
  @action
  disconnectGapJoiner = (railId: number) => {
    const target = this.getRailDataById(railId)

    // 自分のギャップジョイナーを削除する
    layoutStore.currentLayoutData.gapJoiners
      .filter(gapJoiner => gapJoiner.railId === railId)
      .forEach(gapJoiner => layoutStore.deleteGapJoiner(gapJoiner))

    // 対向ジョイントにギャップジョイナーが存在したら削除する
    _.values(target.opposingJoints).map(joint => {
      const opposingGapJoiner = layoutStore.currentLayoutData.gapJoiners
        .find(gapJoiner => gapJoiner.railId === joint.railId && gapJoiner.jointId === joint.jointId)
      if (opposingGapJoiner) {
        layoutStore.deleteGapJoiner(opposingGapJoiner)
      }
    })
  }

  @action
  toggleRail = (railId: number) => {
    const target = this.getRailDataById(railId)
    if (target == null) {
      return
    }

    layoutStore.updateRail({
      id: target.id,
      selected: ! target.selected,
    })
  }

  @action
  selectRail = (railId: number, selected: boolean) => {
    const target = this.getRailDataById(railId)
    if (target == null) {
      return
    }
    if (target.selected === selected) {
      return
    }

    layoutStore.updateRail({
      id: target.id,
      selected: selected
    })
  }

  @action
  selectRails = (railIds: number[], selected: boolean) => {
    railIds.forEach(railId => this.selectRail(railId, selected))
  }

  @action
  selectAllRails = (selected: boolean) => {
    const railIds = layoutStore.currentLayoutData.rails.map(rail => rail.id)
    this.selectRails(railIds, selected)
  }

  @action
  toggleSelectRail = (railId: number) => {
    const target = this.getRailDataById(railId)
    if (target == null) {
      return
    }
    this.selectAllRails(false)
    this.selectRail(railId, ! target.selected)
  }


  @action
  selectFeeder = (feederId: number, selected: boolean) => {
    const target = this.getFeederDataById(feederId)
    if (target == null) {
      return
    }
    layoutStore.updateFeeder({
      id: target.id,
      selected: selected
    })
  }

  @action
  selectFeeders = (feederIds: number[], selected: boolean) => {
    feederIds.forEach(feederId => this.selectFeeder(feederId, selected))
  }

  @action
  selectAllFeeders = (selected: boolean) => {
    const feederIds = layoutStore.currentLayoutData.feeders.map(rail => rail.id)
    this.selectFeeders(feederIds, selected)
  }

  @action
  toggleSelectFeeder = (feederId: number) => {
    const target = this.getFeederDataById(feederId)
    if (target == null) {
      return
    }
    this.selectAllFeeders(false)
    this.selectFeeder(feederId, ! target.selected)
  }

  @action
  selectGapJoiner = (gapJoinerId: number, selected: boolean) => {
    const target = this.getGapJoinerDataById(gapJoinerId)
    if (target == null) {
      return
    }
    layoutStore.updateGapJoiner({
      id: target.id,
      selected: selected
    })
  }

  @action
  selectGapJoiners = (gapJoinerIds: number[], selected: boolean) => {
    gapJoinerIds.forEach(gapJoinerId => this.selectGapJoiner(gapJoinerId, selected))
  }

  @action
  selectAllGapJoiners = (selected: boolean) => {
    const gapJoinerIds = layoutStore.currentLayoutData.gapJoiners.map(rail => rail.id)
    this.selectGapJoiners(gapJoinerIds, selected)
  }

  @action
  toggleSelectGapJoiner = (gapJoinerId: number) => {
    const target = this.getGapJoinerDataById(gapJoinerId)
    if (target == null) {
      return
    }
    this.selectAllGapJoiners(false)
    this.selectGapJoiner(gapJoinerId, ! target.selected)
  }

  @action
  selectAll = (selected: boolean) => {
    switch (builderStore.activeTool) {
      case Tools.FEEDERS:
        this.selectAllFeeders(selected)
        break
      case Tools.GAP_JOINERS:
        this.selectAllGapJoiners(selected)
        break
      default:
        this.selectAllRails(selected)
        break
    }
  }

  @action
  deleteSelectedRails = () => {
    this.deleteRails(layoutStore.selectedRails.map(rail => rail.id))
  }

  @action
  deleteSelectedFeeders = () => {
    const feederIds = layoutStore.currentLayoutData.feeders
      .filter(feeder => feeder.selected)
      .map(feeder => feeder.id)
    feederIds.forEach(id => {
      this.disconnectFeederFromPowerPack(id)
      layoutStore.deleteFeeder({id})
    })
  }

  @action
  deleteSelectedGapJoiners = () => {
    const gapJoinerIds = layoutStore.currentLayoutData.gapJoiners
      .filter(gapJoiner => gapJoiner.selected)
      .map(gapJoiner => gapJoiner.id)
    gapJoinerIds.forEach(id => layoutStore.deleteGapJoiner({id}))
  }

  @action
  deleteSelected = () => {
    switch (builderStore.activeTool) {
      case Tools.FEEDERS:
        this.deleteSelectedFeeders()
        break
      case Tools.GAP_JOINERS:
        this.deleteSelectedGapJoiners()
        break
      default:
        this.deleteSelectedRails()
        break
    }
  }


  @action
  changeToFeederMode = () => {
    layoutStore.enableFeederSockets()
    this.selectAllRails(false)
    this.selectAllGapJoiners(false)
  }

  @action
  changeToGapJoinerMode = () => {
    layoutStore.enableGapsJoinerSockets()
    this.selectAllRails(false)
    this.selectAllFeeders(false)
  }

  @action
  changeToRailMode = () => {
    layoutStore.enableJoints()
    this.selectAllFeeders(false)
    this.selectAllGapJoiners(false)
  }

  @action
  changeToSimulationMode = () => {
    layoutStore.disableAllDetectables()
    this.selectAllRails(false)
    this.selectAllFeeders(false)
    this.selectAllGapJoiners(false)
  }


  @action
  simulateFlow = (feederId: number) => {
    const feeder = this.getFeederDataById(feederId)
    const rail = this.getRailDataById(feeder.railId)
    const railPart = getRailComponent(rail.id).railPart
    const partId = railPart.feederSockets[feeder.socketId].pivotPartIndex

    // フィーダーが接続されているパーツの電流を設定
    layoutStore.updateRail({
      id: feeder.railId,
      flowDirections: {
        [partId]: feeder.direction
      }
    })

    // このパーツに接続されているジョイントの先のレールに電流を設定
    _.range(railPart.joints.length).forEach(jointId => {
      const opposingJoint = rail.opposingJoints[jointId]
      if (! opposingJoint) {
        return
      }
      const joint = railPart.joints[jointId]
      const isComing = this.isCurrentComing(joint.pivot, feeder.direction)
      this.setFlow(opposingJoint.railId, opposingJoint.jointId, isComing)
    })
  }

  isCurrentComing = (pivot: Pivot, direction: FlowDirection) => {
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
  setFlow = (railId: number, jointId: number, isComing: boolean) => {
    const rail = this.getRailDataById(railId)
    const railPart = getRailComponent(railId).railPart
    const joint = railPart.joints[jointId]
    const partId = joint.pivotPartIndex
    let direction
    switch (joint.pivot) {
      case Pivot.LEFT:
        direction = isComing ? FlowDirection.LEFT_TO_RIGHT : FlowDirection.RIGHT_TO_LEFT
        break
      case Pivot.RIGHT:
        direction = isComing ? FlowDirection.RIGHT_TO_LEFT : FlowDirection.LEFT_TO_RIGHT
        break
    }

    layoutStore.updateRail({
      id: railId,
      flowDirections: {
        [partId]: direction
      }
    })

    const anotherJointId = railPart.joints.findIndex(j => j.pivotPartIndex === partId && j.pivot !== joint.pivot)
    const anotherJoint = railPart.joints[anotherJointId]
    const opposingJoint = rail.opposingJoints[anotherJointId]
    if (! opposingJoint) {
      return
    }
    const nextIsComing = this.isCurrentComing(anotherJoint.pivot, direction)
    this.setFlow(opposingJoint.railId, opposingJoint.jointId, nextIsComing)
  }


  @action
  connectFeederToPowerPack = (feederId: number, powerPackId: number) => {
    const target = this.getPowerPackById(powerPackId)
    if (target == null) {
      return
    }

    if (target.supplyingFeederIds.includes(feederId)) {
      return
    }

    this.disconnectFeederFromPowerPack(feederId)

    layoutStore.updatePowerPack({
      id: target.id,
      supplyingFeederIds: [...target.supplyingFeederIds, feederId]
    })
  }

  @action
  disconnectFeederFromPowerPack = (feederId: number) => {
    const target = layoutStore.currentLayoutData.powerPacks.find(p => p.supplyingFeederIds.includes(feederId))
    if (target == null) {
      return
    }

    if (! target.supplyingFeederIds.includes(feederId)) {
      return
    }

    const newFeederIds = target.supplyingFeederIds.filter(id => id !== feederId)
    layoutStore.updatePowerPack({
      id: target.id,
      supplyingFeederIds: newFeederIds
    })
  }

  @action
  connectTurnoutToSwitcher = (railId: number, conductionStates: ConductionStates, switcherId: number) => {
    const target = this.getSwitcherById(switcherId)
    if (target == null) {
      return
    }

    this.disconnectTurnoutFromSwitcher(railId)

    const newConductionStates = target.conductionStates
    _.keys(conductionStates).forEach(idx => {
      newConductionStates[idx] = [...target.conductionStates[idx], ...conductionStates[idx]]
    })

    layoutStore.updateSwitcher({
      id: switcherId,
      conductionStates: newConductionStates
    })
  }

  @action
  disconnectTurnoutFromSwitcher = (railId: number) => {
    const target = layoutStore.getSwitcherByRailId(railId)
    if (target == null) {
      return
    }

    let newConductionStates = {}
    _.keys(target.conductionStates).forEach(idx => {
      newConductionStates[idx] = target.conductionStates[idx].filter(state => state.railId !== railId)
    })

    layoutStore.updateSwitcher({
      id: target.id,
      conductionStates: newConductionStates
    })
  }

  @action
  changeSwitcherState = (switcherId: number, state: number) => {
    const target = this.getSwitcherById(switcherId)
    if (target == null) {
      return
    }

    // レールの状態更新
    target.conductionStates[state].forEach(s => {
      layoutStore.updateRail({
        id: s.railId,
        conductionState: s.conductionState
      })
    })

    // Switcherの状態更新
    layoutStore.updateSwitcher({
      id: switcherId,
      currentState: state
    })
  }

  @action
  changeSwitcherConductionTable = (switcherId: number, conductionStates: ConductionStates) => {
    const target = this.getSwitcherById(switcherId)
    if (target == null) {
      return
    }

    conductionStates[target.currentState].forEach(s => {
      layoutStore.updateRail({
        id: s.railId,
        conductionState: s.conductionState
      })
    })

    // Switcherの状態更新
    layoutStore.updateSwitcher({
      id: switcherId,
      conductionStates: conductionStates
    })

  }


  private getRailDataById = (id: number) => {
    return layoutStore.currentLayoutData.rails.find(item => item.id === id)
  }

  private getFeederDataById = (id: number) => {
    return layoutStore.currentLayoutData.feeders.find(item => item.id === id)
  }

  private getGapJoinerDataById = (id: number) => {
    return layoutStore.currentLayoutData.gapJoiners.find(item => item.id === id)
  }

  private getPowerPackById = (id: number) => {
    return layoutStore.currentLayoutData.powerPacks.find(p => p.id === id)
  }

  private getSwitcherById = (id: number) => {
    return layoutStore.currentLayoutData.switchers.find(p => p.id === id)
  }

}

export default new LayoutLogicStore()
