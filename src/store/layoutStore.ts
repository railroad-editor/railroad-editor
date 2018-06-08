import {RailData} from "components/rails";
import {action, computed, observable, reaction, toJS, when} from "mobx";
import LayoutAPI from "apis/layout";
import commonStore from "./commonStore";
import builderStore, {PlacingMode} from "./builderStore";
import {DEFAULT_GRID_SIZE, DEFAULT_INITIAL_ZOOM, DEFAULT_PAPER_HEIGHT, DEFAULT_PAPER_WIDTH} from "constants/tools";
import {getAllOpenCloseJoints} from "components/rails/utils";
import getLogger from "logging";
import * as uuidv4 from "uuid/v4";
import * as moment from "moment";
import StorageAPI from "apis/storage"
import {FeederInfo, GapJoinerInfo} from "components/rails/RailBase";

const LOGGER = getLogger(__filename)


export interface LayoutConfig {
  paperWidth: number
  paperHeight: number
  gridSize: number
  backgroundImageUrl: string
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
  feeders: FeederInfo[]
  gapJoiners: GapJoinerInfo[]
}

export interface LayerData {
  id: number
  name: string
  visible: boolean
  color: string
  opacity: number
}


export const INITIAL_LAYER_DATA = {
  id: 1,
  name: 'Layer 1',
  visible: true,
  color: '#000',
  opacity: 1.0,

}

export const DEFAULT_LAYER_DATA = {
  id: 0,
  name: '',
  visible: true,
  color: '#000',
  opacity: 1.0,
}

export const INITIAL_STATE: LayoutStoreState = {
  histories: [
    {
      layers: [INITIAL_LAYER_DATA],
      rails: [],
      feeders: [],
      gapJoiners: [],
    }
  ],
  historyIndex: 0,
  meta: {
    id: uuidv4(),
    name: 'Untitled',
    lastModified: moment().valueOf()
  },
  config: {
    paperWidth: DEFAULT_PAPER_WIDTH,
    paperHeight: DEFAULT_PAPER_HEIGHT,
    gridSize: DEFAULT_GRID_SIZE,
    backgroundImageUrl: ''
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

    reaction(
      () => this.currentLayoutData.rails.length,
      () => {
        if (this.isLayoutEmpty) {
          builderStore.setPlacingMode(PlacingMode.FREE)
        } else {
          builderStore.setPlacingMode(PlacingMode.JOINT)
        }
      }

    )
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
  get selectedRails() {
    return this.currentLayoutData.rails.filter(r => r.selected)
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
  get unconnectedCloseJoints() {
    return getAllOpenCloseJoints(this.currentLayoutData.rails)
  }

  @computed
  get nextFeederId() {
    let ids = this.currentLayoutData.feeders.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get nextGapJoinerId() {
    let ids = this.currentLayoutData.gapJoiners.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  /**
   * レール系 Add/Update/Delete
   */

  @action
  addRail = (item: RailData) => {
    item.id = this.nextRailId
    this.currentLayoutData.rails.push(item)
  }

  @action
  addRails = (items: RailData[]) => {
    items.forEach(item => this.addRail(item))
  }

  @action
  updateRail = (item: Partial<RailData>) => {
    const index = this.currentLayoutData.rails.findIndex(rail => rail.id === item.id)
    const target = this.currentLayoutData.rails[index]

    // 明示的にnull指定されたらリセットする
    const opposingJoints = item.opposingJoints === null ? {} : removeEmpty({
      ...target.opposingJoints,
      ...item.opposingJoints
    })
    // 明示的にnull指定されたらリセットする
    const flowDirections = item.flowDirections === null ? {} : removeEmpty({
      ...target.flowDirections,
      ...item.flowDirections
    })

    this.currentLayoutData.rails[index] = {
      ...target,
      ...item,
      opposingJoints: opposingJoints,
      flowDirections: flowDirections
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
  }

  @action
  deleteRails = (items: Partial<RailData>[]) => {
    items.forEach(item => this.deleteRail(item))
  }

  /**
   * レイヤー系 Add/Update/Delete
   */

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

  /**
   * ヒストリ操作系
   */

  @action
  commit = () => {
    const layout = toJS(this.currentLayoutData)
    LOGGER.info('LayoutStore#commit', layout)
    this.histories[this.historyIndex+1] = layout
    this.historyIndex += 1
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

  /**
   * レイアウトメタ情報 Set/Update
   */

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

  /**
   * レイアウト Save/Load
   */

  @action
  saveLayout = async (showMessage?: any) => {
    const userId = commonStore.userInfo.username
    // メタデータを更新
    this.setLayoutMeta({
      ...this.meta,
      lastModified: moment().valueOf()
    })
    // レイアウトデータをセーブ
    LayoutAPI.saveLayoutData(
      commonStore.currentUser,
      this.currentLayoutData,
      this.meta,
      this.config,
      builderStore.userRailGroups,
      builderStore.userRails
    )
    // レイアウト画像をセーブ
    await StorageAPI.saveCurrentLayoutImage(userId, this.meta.id)
    // 背景画像が設定されていたらセーブ
    if (this.config.backgroundImageUrl) {
      await StorageAPI.saveBackgroundImage(userId, this.meta.id, this.config.backgroundImageUrl)
    }

    await commonStore.loadLayoutList()
    if (showMessage) showMessage("Saved successfully.")
  }

  @action
  loadLayout = async (layoutId: string) => {
    const layout = await LayoutAPI.fetchLayoutData(commonStore.currentUser, layoutId)
    this.setLayoutData(layout.layout)
    this.setLayoutMeta(layout.meta)
    this.setConfig(layout.config)
    builderStore.setUserRailGroups(layout.userRailGroups)
    builderStore.setUserRails(layout.userRails)
  }

  @action
  setLayoutData = (layoutData: LayoutData) => {
    this.histories = [layoutData]
    this.historyIndex = 0
  }

  /**
   * 設定系 Set/Update
   */

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

  /**
   * フィーダー系 Add/Update/Delete
   */

  @action
  addFeeder = (item: FeederInfo) => {
    // IDはここで発行
    this.currentLayoutData.feeders.push({
      ...item,
      id: this.nextFeederId,
    })
  }

  @action
  updateFeeder = (item: Partial<FeederInfo>) => {
    const index = this.currentLayoutData.feeders.findIndex(feeder => feeder.id === item.id)
    const target = this.currentLayoutData.feeders[index]

    this.currentLayoutData.feeders[index] = {
      ...target,
      ...item
    }
  }

  @action
  deleteFeeder = (item: Partial<FeederInfo>) => {
    this.currentLayoutData.feeders = this.currentLayoutData.feeders.filter(feeder => feeder.id !== item.id)
  }

  /**
   * ギャップジョイナー系 Add/Update/Delete
   */

  @action
  addGapJoiner = (item: GapJoinerInfo) => {
    // IDはここで発行
    this.currentLayoutData.gapJoiners.push({
      ...item,
      id: this.nextGapJoinerId,
    })
  }

  @action
  updateGapJoiner = (item: Partial<GapJoinerInfo>) => {
    const index = this.currentLayoutData.gapJoiners.findIndex(gapJoiner => gapJoiner.id === item.id)
    const target = this.currentLayoutData.gapJoiners[index]

    this.currentLayoutData.gapJoiners[index] = {
      ...target,
      ...item
    }
  }

  @action
  deleteGapJoiner = (item: Partial<GapJoinerInfo>) => {
    this.currentLayoutData.gapJoiners = this.currentLayoutData.gapJoiners.filter(gapJoiner => gapJoiner.id !== item.id)
  }

  @action
  enableJoints = () => {
    const nextRails = this.currentLayoutData.rails.map(rail => {
      return {
        ...rail,
        enableJoints: true,
        enableFeederSockets: false,
        enableGapJoinerSockets: false,
      }
    })
    this.updateRails(nextRails)
  }

  @action
  enableFeederSockets = () => {
    const nextRails = this.currentLayoutData.rails.map(rail => {
      return {
        ...rail,
        enableJoints: false,
        enableFeederSockets: true,
        enableGapJoinerSockets: false,
      }
    })
    this.updateRails(nextRails)
  }

  @action
  enableGapsJoinerSockets = () => {
    const nextRails = this.currentLayoutData.rails.map(rail => {
      return {
        ...rail,
        enableJoints: false,
        enableFeederSockets: false,
        enableGapJoinerSockets: true,
      }
    })
    this.updateRails(nextRails)
  }

  getRailDataById = (id: number) => {
    return this.currentLayoutData.rails.find(item => item.id === id)
  }

  getFeederDataById = (id: number) => {
    return this.currentLayoutData.feeders.find(item => item.id === id)
  }

  getGapJoinerDataById = (id: number) => {
    return this.currentLayoutData.gapJoiners.find(item => item.id === id)
  }
}


const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => (obj[key] == null) && delete obj[key]);
  return obj
}


export default new LayoutStore(INITIAL_STATE)
