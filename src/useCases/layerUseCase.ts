import {LayerPaletteStore} from "stores/layerPaletteStore";
import {action} from "mobx";
import {LayerData, LayoutStore} from "stores/layoutStore";
import {RailToolUseCase} from "./railToolUseCase";

export class LayerUseCase {

  private layoutStore: LayoutStore
  private layerPaletteStore: LayerPaletteStore
  private railToolUseCase: RailToolUseCase

  constructor(layoutStore: LayoutStore, layerPaletteStore: LayerPaletteStore, railToolUseCase: RailToolUseCase) {
    this.layoutStore = layoutStore
    this.layerPaletteStore = layerPaletteStore
    this.railToolUseCase = railToolUseCase
  }

  @action
  addLayer = (layerData: LayerData) => {
    this.layoutStore.addLayer(layerData)
  }

  @action
  updateLayer = (layerData: Partial<LayerData>) => {
    this.layoutStore.updateLayer(layerData)
  }

  @action
  deleteLayer = (layerId: number) => {
    // レイヤー上のレールのジョイントを全て解放する
    const layerRailIds = this.layoutStore.currentLayoutData.rails
      .filter(rail => rail.layerId === layerId)
      .map(rail => rail.id)
    this.railToolUseCase.disconnectJoints(layerRailIds)

    // レイアウト上のレイヤーデータを削除
    this.layoutStore.deleteLayer({id: layerId})

    // アクティブレイヤーを消した場合、最も小さいレイヤーIDを自動的にアクティブレイヤーとする
    if (this.layerPaletteStore.activeLayerId === layerId) {
      const restLayerIds = this.layoutStore.currentLayoutData.layers
        .filter(layer => layer.id !== layerId)
        .map(layer => layer.id)
      this.layerPaletteStore.setActiveLayer(restLayerIds[0])
    }
  }
}