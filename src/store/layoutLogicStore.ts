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


  private getRailDataById = (id: number) => {
    return this.layoutStore.currentLayoutData.rails.find(item => item.id === id)
  }
}

export default new LayoutLogicStore()
