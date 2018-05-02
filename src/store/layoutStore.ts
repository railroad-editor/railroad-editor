import update from 'immutability-helper';
import {RailData, RailGroupData} from "components/rails";
import {action, computed, observable} from "mobx";
import {LayoutDataWithMeta} from "apis/layout";
import commonStore from "./commonStore";
import builderStore from "./builderStore";
import LayoutAPI from "apis/layout";
import {UserRailGroupData} from "store/builderStore";
import {DEFAULT_GRID_SIZE, DEFAULT_INITIAL_ZOOM, DEFAULT_PAPER_HEIGHT, DEFAULT_PAPER_WIDTH} from "constants/tools";
import {createViewModel} from "mobx-utils";
import {getAllOpenCloseJoints} from "components/rails/utils";
import * as mobx from "mobx"


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
  addRail = (item: RailData, commit = true) => {
    if (commit) this.commit()

    item.id = this.nextRailId
    this.currentLayoutData.rails.push(item)
  }

  @action
  updateRail = (item: Partial<RailData>, commit = true) => {
    if (commit) this.commit()

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
  updateRails = (items: Partial<RailData>[], commit = true) => {
    if (commit) this.commit()

    items.forEach(item => this.updateRail(item, false))

    // this.currentLayoutData.rails.forEach(r => {
    //   r.selected = true
    // })
  }


  @action
  deleteRail = (item: Partial<RailData>, overwrite = false) => {
    const layout = this.histories[this.historyIndex]

    const newLayout = _.clone(layout);
    newLayout.rails = layout.rails.filter(rail => ! (rail.id === item.id))
    // レールグループに所属していたら削除する
    newLayout.railGroups = layout.railGroups.map(group => {
      return {
        ...group,
        rails: group.rails.filter( r => ! (r === item.id))
      }
    })
    // ヒストリを更新
    return this.addHistory(newLayout, overwrite)
  }


  @action
  addRailGroup = (item: RailGroupData, children: RailData[], overwrite = false) => {
    const layout = this.histories[this.historyIndex]

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

    // レイアウトを更新
    const newLayout = update(layout, {
      rails: {$push: newChildren},
      railGroups: {$push: [newRailGroup]}
    })
    // ヒストリを更新
    return this.addHistory(newLayout, overwrite)
  }

  @action
  deleteRailGroup = (item: Partial<RailGroupData>, overwrite: boolean) => {
    const layout = this.histories[this.historyIndex]
    // 対象のレールグループを探す
    const itemIndex = layout.railGroups.findIndex((item) => item.id === item.id)
    // 見つからなかったら何もしない
    if (itemIndex === -1) {
      return
    }
    // 対象のレールグループに所属しないレールを探す
    const children = layout.rails.filter(r => ! (r.groupId === layout.railGroups[itemIndex].id))

    // レイアウトを更新
    const newLayout = update(layout, {
      rails: {$set: children},
      railGroups: {$splice: [[itemIndex, 1]]}
    })
    // ヒストリを更新
    return this.addHistory(newLayout, overwrite)
  }

  @action
  addLayer = (item: LayerData, overwrite = false) => {
    item.id = this.nextLayerId
    const layout = this.histories[this.historyIndex]
    const newLayout = createViewModel(layout);
    newLayout.layers.push(item)
    newLayout.submit()

    // ヒストリを更新
    return this.addHistory(newLayout, overwrite)
  }

  @action
  updateLayer = (item: Partial<LayerData>, overwrite = false) => {
    const layout = this.histories[this.historyIndex]

    const newLayout = createViewModel(layout);
    newLayout.layers = newLayout.layers.map(layer => {
      if (layer.id === item.id) {
        return {
          ...layer,
          ...item
        }
      } else {
        return layer
      }
    })
    newLayout.submit()

    // ヒストリを更新
    return this.addHistory(newLayout, overwrite)
  }

  @action
  deleteLayer = (id: number, overwrite = false) => {
    const layout = this.histories[this.historyIndex]
    // 対象のアイテムを探す
    const itemIndex = layout.layers.findIndex(layer => layer.id === id)
    // 見つからなかったら何もしない
    if (itemIndex === -1) {
      return
    }
    // レイヤーに所属しないレール
    const rails = layout.rails.filter(rail => rail.layerId !== id)

    // レイアウトを更新
    const newLayout = update(layout, {
      layers: {$splice: [[itemIndex, 1]]},
      rails: {$set: rails}
    })
    // ヒストリを更新
    return this.addHistory(newLayout, overwrite)

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

  @action
  addCurrentLayoutToHistory = () => {
    const layout = this.histories[this.historyIndex]
    return this.addHistory(layout, false)
  }

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

  commit = () => {
    this.histories[this.historyIndex+1] = mobx.toJS(this.currentLayoutData)
    this.historyIndex += 1
  }

  addHistory = (layout: LayoutData, overwrite = false) => {
    if (overwrite) {
      this.histories[this.historyIndex] = layout
    } else {
      this.histories[this.historyIndex+1] = layout
      this.historyIndex += 1
    }
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
