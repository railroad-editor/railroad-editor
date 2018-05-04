import {RailData, RailGroupData} from "components/rails";
import * as mobx from "mobx";
import {action, computed, observable} from "mobx";
import LayoutAPI from "apis/layout";
import commonStore from "./commonStore";
import builderStore from "./builderStore";
import {DEFAULT_GRID_SIZE, DEFAULT_INITIAL_ZOOM, DEFAULT_PAPER_HEIGHT, DEFAULT_PAPER_WIDTH} from "constants/tools";
import {getAllOpenCloseJoints} from "components/rails/utils";


export interface LayoutConfig {
  paperWidth: number
  paperHeight: number
  gridSize: number
  initialZoom: number
}

export interface LayoutMeta {
  id: string
  name: string
  lastModified: number
}

export interface LayoutStoreState {
  histories: LayoutData[]
  historyIndex: number
  meta: LayoutMeta
  config: LayoutConfig
}

export interface LayoutData {
  layers: LayerData[]
  rails: RailData[]
  railGroups: RailGroupData[]
}

export interface LayerData {
  id: number
  name: string
  visible: boolean
  color: string
}


export const INITIAL_STATE: LayoutStoreState = {
  histories: [
    {
      layers: [
        {
          id: 1,
          name: 'Layer 1',
          visible: true,
          color: '#000'
        }
      ],
      rails: [],
      railGroups: []
    }
  ],
  historyIndex: 0,
  meta: null,
  config: {
    paperWidth: DEFAULT_PAPER_WIDTH,
    paperHeight: DEFAULT_PAPER_HEIGHT,
    gridSize: DEFAULT_GRID_SIZE,
    initialZoom: DEFAULT_INITIAL_ZOOM
  }
}


export class LayoutStore {
  @observable histories: LayoutData[]
  @observable historyIndex: number
  @observable meta: LayoutMeta
  @observable config: LayoutConfig

  constructor({histories, historyIndex, meta, config}) {
    this.histories = histories
    this.historyIndex = historyIndex
    this.meta = meta
    this.config = config
  }

  @computed
  get currentLayoutData() {
    return this.histories[this.historyIndex]
  }

  @computed
  get activeLayerData() {
    return this.currentLayoutData.layers.find(layer => layer.id === builderStore.activeLayerId)
  }

  @computed
  get activeLayerRails() {
    return this.currentLayoutData.rails.filter(r => r.layerId === builderStore.activeLayerId)
  }

  @computed
  get isLayoutEmpty() {
    return this.currentLayoutData.rails.length === 0
  }

  @computed
  get canUndo() {
    return this.historyIndex > 0
  }

  @computed
  get canRedo() {
    return this.histories.length > 1 && this.historyIndex + 1 < this.histories.length
  }

  @computed
  get nextLayerId() {
    let ids = this.currentLayoutData.layers.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get nextRailId() {
    let ids = this.currentLayoutData.rails.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get nextRailGroupId() {
    let ids = this.currentLayoutData.railGroups.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get unconnectedCloseJoints() {
    return getAllOpenCloseJoints(this.currentLayoutData.rails)
  }

  @action
  addRail = (item: RailData) => {
    item.id = this.nextRailId
    this.currentLayoutData.rails.push(item)
  }

  @action
  updateRail = (item: Partial<RailData>) => {
    const index = this.currentLayoutData.rails.findIndex(rail => rail.id === item.id)
    const target = this.currentLayoutData.rails[index]

    this.currentLayoutData.rails[index] = {
      ...target,
      ...item,
      opposingJoints: removeEmpty({
        ...target.opposingJoints,
        ...item.opposingJoints
      })
    }
  }

  @action
  updateRails = (items: Partial<RailData>[]) => {
    items.forEach(item => this.updateRail(item))
  }

  @action
  deleteRail = (item: Partial<RailData>) => {
    // レールリストから削除
    this.currentLayoutData.rails = this.currentLayoutData.rails.filter(rail => rail.id !== item.id)
    // レールグループに所属していたら削除
    this.currentLayoutData.railGroups = this.currentLayoutData.railGroups.map(group => {
      return {
        ...group,
        rails: group.rails.filter( r => ! (r === item.id))
      }
    })
  }

  @action
  deleteRails = (items: Partial<RailData>[]) => {
    items.forEach(item => this.deleteRail(item))
  }


  @action
  addRailGroup = (item: RailGroupData, children: RailData[], overwrite = false) => {
    item.id = this.nextRailGroupId

    // 各レールにグループIDを付与する
    const newChildren = children.map(c => {
      return {
        ...c,
        groupId: item.id
      }
    })

    const newRailGroup = {
      ...item,
      rails: newChildren.map(c => c.id)
    }

    this.currentLayoutData.rails.push(...newChildren)
    this.currentLayoutData.railGroups.push(newRailGroup)
  }

  @action
  deleteRailGroup = (item: Partial<RailGroupData>) => {
    this.currentLayoutData.rails = this.currentLayoutData.rails.filter(rail => rail.groupId !== item.id)
    this.currentLayoutData.railGroups = this.currentLayoutData.railGroups.filter(railGroup => railGroup.id !== item.id)
  }

  @action
  addLayer = (item: LayerData) => {
    item.id = this.nextLayerId
    this.currentLayoutData.layers.push(item)
  }

  @action
  updateLayer = (item: Partial<LayerData>) => {
    const index = this.currentLayoutData.layers.findIndex(rail => rail.id === item.id)
    const target = this.currentLayoutData.layers[index]

    this.currentLayoutData.layers[index] = {
      ...target,
      ...item,
    }
  }

  @action
  deleteLayer = (item: Partial<LayerData>) => {
    this.currentLayoutData.layers = this.currentLayoutData.layers.filter(layer => layer.id !== item.id)
    // レイヤーに所属するレールを削除
    this.currentLayoutData.rails = this.currentLayoutData.rails.filter(rail => rail.layerId !== item.id)
  }

  @action
  undo = () => {
    if (this.historyIndex > 0) {
      this.historyIndex += -1
    }
  }

  @action
  redo = () => {
    if (this.histories.length > 1 && this.historyIndex < this.histories.length - 1) {
      this.historyIndex += 1
    }
  }

  @action
  clearHistory = () => {
    // TODO: implement
  }

  @action
  setLayoutMeta = (meta: LayoutMeta) => {
    this.meta = meta

  }

  @action
  updateLayoutMeta = (meta: Partial<LayoutMeta>) => {
    this.meta = {
      ...this.meta,
      ...meta
    }
  }

  @action
  setLayoutData = (layoutData: LayoutData) => {
    this.histories = [layoutData]
    this.historyIndex = 0
  }

  // @action
  // addCurrentLayoutToHistory = () => {
  //   const layout = this.histories[this.historyIndex]
  //   return this.addHistory(layout, false)
  // }

  @action
  saveLayout = async () => {
    LayoutAPI.saveLayoutData(
      commonStore.currentUser,
      this.currentLayoutData,
      this.meta,
      builderStore.userRailGroups,
      builderStore.userRails
    )
  }

  @action
  loadLayout = async (layoutId: string) => {
    const layout = await LayoutAPI.fetchLayoutData(commonStore.currentUser, layoutId)
    this.setLayoutData(layout.layout)
    this.setLayoutMeta(layout.meta)
    // TODO: temporary
    // this.setConfig(layout.config)
    builderStore.setUserRailGroups(layout.userRailGroups)
    builderStore.setUserRails(layout.userCustomRails)
  }

  @action
  setConfig = (config: LayoutConfig) => {
    this.config = config
  }

  @action
  updateConfig = (config: Partial<LayoutConfig>) => {
    this.config = {
      ...this.config,
      ...config
    }
  }

  @action
  commit = () => {
    this.histories[this.historyIndex+1] = mobx.toJS(this.currentLayoutData)
    this.historyIndex += 1
  }

}


const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => (obj[key] == null) && delete obj[key]);
  return obj
}

// const getAllIndexes = (arr, val) => {

//   for(i = 0; i < arr.length; i++)
//     if (arr[i] === val)
//       indexes.push(i);
//   return indexes;
// }

export default new LayoutStore(INITIAL_STATE)
