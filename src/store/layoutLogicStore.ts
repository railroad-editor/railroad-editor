import {action} from "mobx";
import getLogger from "logging";
import layoutStore, {LayoutStore} from "store/layoutStore";
import builderStore, {BuilderStore} from "store/builderStore";
import {JointPair} from "components/hoc/withBuilder";

const LOGGER = getLogger(__filename)


export class LayoutLogicStore {
  layoutStore: LayoutStore
  builderStore: BuilderStore
  
  constructor() {
    this.layoutStore = layoutStore
    this.builderStore = builderStore
  }

  @action
  deleteSelectedRails = () => {
    this.deleteRails(this.layoutStore.selectedRails.map(rail => rail.id))
  }

  @action
  deleteRails = (railIds: number[]) => {
    railIds.forEach(id => this.deleteRail(id))
  }

  @action
  deleteRail = (railId: number) => {
    // フィーダーを削除
    this.layoutStore.currentLayoutData.feeders
      .filter(feeder => feeder.railId === railId)
      .forEach(feeder => this.layoutStore.deleteFeeder(feeder))
    // ジョイントを解除
    this.disconnectJoint(railId)
    this.layoutStore.deleteRail({id: railId})
  }

  @action
  deleteLayer = (layerId: number) => {
    // レイヤー上のレールを全て接続解除してから削除する
    const layerRailIds = this.layoutStore.currentLayoutData.rails
      .filter(rail => rail.layerId === layerId)
      .map(rail => rail.id)
    this.disconnectJoints(layerRailIds)
    this.layoutStore.deleteLayer({id: layerId})

    // アクティブレイヤーを消した場合
    if (this.builderStore.activeLayerId === layerId) {
      const restLayerIds = this.layoutStore.currentLayoutData.layers
        .filter(layer => layer.id !== layerId)
        .map(layer => layer.id)
      this.builderStore.setActiveLayer(restLayerIds[0])
    }
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

  @action
  connectJoints = (pairs: JointPair[]) => {
    pairs.forEach(pair => this.connectJoint(pair))
  }

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

    this.layoutStore.updateRails(updatedData)
  }

  @action
  disconnectJoints = (railIds: number[]) => {
    railIds.forEach(id => this.disconnectJoint(id))
  }

  @action
  disconnectGapJoiner = (railId: number) => {
    const target = this.getRailDataById(railId)

    // 自分のギャップジョイナーを削除する
    this.layoutStore.currentLayoutData.gapJoiners
      .filter(gapJoiner => gapJoiner.railId === railId)
      .forEach(gapJoiner => this.layoutStore.deleteGapJoiner(gapJoiner))

    // 対向ジョイントにギャップジョイナーが存在したら削除する
    _.values(target.opposingJoints).map(joint => {
      const opposingGapJoiner = this.layoutStore.currentLayoutData.gapJoiners
        .find(gapJoiner => gapJoiner.railId === joint.railId && gapJoiner.jointId === joint.jointId)
      if (opposingGapJoiner) {
        this.layoutStore.deleteGapJoiner(opposingGapJoiner)
      }
    })
  }

  @action
  toggleRail = (railId: number) => {
    const target = this.getRailDataById(railId)
    if (target == null) {
      return
    }

    this.layoutStore.updateRail({
      id: target.id,
      selected: !target.selected,
    })
  }

  @action
  selectRail = (railId: number, selected: boolean) => {
    const target = this.getRailDataById(railId)
    if (target == null) {
      return
    }

    this.layoutStore.updateRail({
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
    const railIds = this.layoutStore.currentLayoutData.rails.map(rail => rail.id)
    this.selectRails(railIds, selected)
  }

  @action
  selectFeeder = (feederId: number, selected: boolean) => {
    const target = this.getFeederDataById(feederId)
    if (target == null) {
      return
    }
    this.layoutStore.updateFeeder({
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
    const feederIds = this.layoutStore.currentLayoutData.feeders.map(rail => rail.id)
    this.selectFeeders(feederIds, selected)
  }

  @action
  selectGapJoiner = (gapJoinerId: number, selected: boolean) => {
    const target = this.getGapJoinerDataById(gapJoinerId)
    if (target == null) {
      return
    }
    this.layoutStore.updateGapJoiner({
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
    const gapJoinerIds = this.layoutStore.currentLayoutData.gapJoiners.map(rail => rail.id)
    this.selectGapJoiners(gapJoinerIds, selected)
  }



  @action
  changeToFeederMode = () => {
    this.layoutStore.enableFeederSockets()
    this.selectAllRails(false)
    this.selectAllGapJoiners(false)
  }

  @action
  changeToGapJoinerMode = () => {
    this.layoutStore.enableGapsJoinerSockets()
    this.selectAllRails(false)
    this.selectAllFeeders(false)
  }

  @action
  changeToRailMode = () => {
    this.layoutStore.enableJoints()
    this.selectAllFeeders(false)
    this.selectAllGapJoiners(false)
  }


  private getRailDataById = (id: number) => {
    return this.layoutStore.currentLayoutData.rails.find(item => item.id === id)
  }

  private getFeederDataById = (id: number) => {
    return this.layoutStore.currentLayoutData.feeders.find(item => item.id === id)
  }

  private getGapJoinerDataById = (id: number) => {
    return this.layoutStore.currentLayoutData.gapJoiners.find(item => item.id === id)
  }
}

export default new LayoutLogicStore()
