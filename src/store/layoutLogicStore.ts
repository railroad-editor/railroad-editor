import {action} from "mobx";
import getLogger from "logging";
import layoutStore from "store/layoutStore";
import builderStore, {PlacingMode} from "store/builderStore";
import {JointPair} from "containers/hoc/withBuilder";
import {Tools} from "constants/tools";
import commonStore, {EditorMode} from "./editorStore";
import StorageAPI from "apis/storage"
import LayoutAPI from "apis/layout";
import moment from "moment";
import FlowSimulator from "./FlowSimulator";
import simulatorActions from "./simulatorActions";

const LOGGER = getLogger(__filename)


/**
 * LayoutStoreが肥大化しすぎるのを防ぐため、
 * LayoutStoreには単純なCRUDに当たるメソッドだけを定義し、
 * ロジックをこのStoreに集中させた。
 */
export class LayoutLogicStore {

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
    if (commonStore.mode === EditorMode.BUILDER) {
      FlowSimulator.stop()
    }
  }

  /**
   * フィーダーを削除する。
   * @param {number} feederId
   */
  @action
  deleteFeeder = (feederId: number) => {
    simulatorActions.disconnectFeederFromPowerPack(feederId)
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
    simulatorActions.disconnectTurnoutFromSwitcher(railId)
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
      simulatorActions.disconnectFeederFromPowerPack(id)
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



  private getRailDataById = (id: number) => {
    return layoutStore.currentLayoutData.rails.find(item => item.id === id)
  }

  private getFeederDataById = (id: number) => {
    return layoutStore.currentLayoutData.feeders.find(item => item.id === id)
  }

  private getGapJoinerDataById = (id: number) => {
    return layoutStore.currentLayoutData.gapJoiners.find(item => item.id === id)
  }

}

export default new LayoutLogicStore()
