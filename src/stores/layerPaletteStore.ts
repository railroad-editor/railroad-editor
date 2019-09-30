import {action, observable} from "mobx";


export class LayerPaletteStore {
  // 現在アクティブ（編集中）のレイヤーID
  @observable activeLayerId: number

  constructor() {
    this.activeLayerId = 1
  }

  @action
  setActiveLayer = (layerId: number) => {
    this.activeLayerId = layerId
  }
}

export default new LayerPaletteStore()