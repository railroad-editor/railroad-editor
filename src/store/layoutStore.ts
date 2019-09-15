import {RailComponentClasses, RailData} from "containers/rails";
import {action, computed, observable, toJS} from "mobx";
import builderStore from "./builderStore";
import {DEFAULT_GRID_SIZE, DEFAULT_PAPER_HEIGHT, DEFAULT_PAPER_WIDTH} from "constants/tools";
import {getAllOpenCloseJoints} from "containers/rails/utils";
import getLogger from "logging";
import * as uuidv4 from "uuid/v4";
import moment from "moment";
import TrainController from "containers/Editor/ToolBar/SimulatorToolBar/TrainController";
import railItems from "constants/railItems.json";
import {computedFn} from "mobx-utils";
import {FeederInfo, GapJoinerInfo} from "react-rail-components";
import simulatorStore from "./sandboxStore";

const LOGGER = getLogger(__filename)


export interface LayoutConfig {
  paperWidth: number
  paperHeight: number
  gridSize: number
  backgroundImageUrl: string
  railSetName: string
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
  powerPacks: PowerPackData[]
  switchers: SwitcherData[]
  script: string
}

export interface LayerData {
  id: number
  name: string
  visible: boolean
  color: string
  opacity: number
}

export interface PowerPackData {
  id: number
  name: string
  power: number
  direction: boolean
  supplyingFeederIds: number[]
  color: string
  isError: boolean
  pPin?: number
  dPin?: number
}

export enum SwitcherType {
  NORMAL = 'Normal',
  THREE_WAY = '3-Way',
}

/**
 * conductionState の例
 * {
 *   0: [
 *        {
 *          railId: 1, conductionState: 0
 *        },
 *        {
 *          railId: 2, conductionState: 1
 *        }
 *      ],
 *   1: [
 *        {
 *          railId: 1, conductionState: 1
 *        },
 *        {
 *          railId: 2, conductionState: 0
 *        }
 *      ],
 */
export interface SwitcherData {
  id: number
  name: string
  type: SwitcherType
  currentState: number
  conductionStates: ConductionStates
  color: string
  dPins?: number[]
}

export interface ConductionStates {
  [state: number]: ConductionState[]
}

export interface ConductionState {
  railId: number
  conductionState: number
}

export interface TrainControllerConfig {
  powerPacks: PowerPackPinConfig[]
  switchers: SwitcherPinConfig[]
}

export interface PowerPackPinConfig {
  pPin: number
  dPin: number
}

export interface SwitcherPinConfig {
  dPins: number[]
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
      powerPacks: [],
      switchers: [],
      script: ''
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
    backgroundImageUrl: '',
    railSetName: 'TOMIX'
  }
}


/**
 * レイアウトに関する永続的なデータを保持・操作するStore
 */
export class LayoutStore {
  @observable histories: LayoutData[]
  @observable historyIndex: number
  @observable meta: LayoutMeta
  @observable config: LayoutConfig

  constructor({histories, historyIndex, meta, config}) {
    this.initialize({histories, historyIndex, meta, config})
  }

  initialize = ({histories, historyIndex, meta, config}) => {
    this.histories = histories
    this.historyIndex = historyIndex
    this.meta = meta
    this.config = config
  }

  @action
  resetLayoutData = () => {
    this.initialize(INITIAL_STATE)
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

  @computed
  get nextPowerPackId() {
    let ids = this.currentLayoutData.powerPacks.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get nextSwitcherId() {
    let ids = this.currentLayoutData.switchers.map(r => r.id)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get nextTurnoutId() {
    const ids = this.currentLayoutData.rails
      .filter(r => RailComponentClasses[r.type].defaultProps.numConductionStates > 1)
      .filter(r => r.turnoutId)
      .map(r => r.turnoutId)
    return ids.length > 0 ? Math.max(...ids) + 1 : 1
  }

  @computed
  get trainControllerConfig(): TrainControllerConfig {
    return {
      powerPacks: this.currentLayoutData.powerPacks.map(p => {
        return {dPin: p.dPin, pPin: p.pPin}
      }),
      switchers: this.currentLayoutData.switchers.map(s => {
        return {dPins: s.dPins}
      })
    }
  }

  @computed
  get presetRailItems() {
    return railItems[this.config.railSetName]
  }

  feedersByRailId = computedFn(function feedersByRailId(this: LayoutStore, railId: number) {
    return this.currentLayoutData.feeders.filter(f => f.railId === railId)
  })

  gapJoinersByRailId = computedFn(function feedersByRailId(this: LayoutStore, railId: number) {
    return this.currentLayoutData.gapJoiners.filter(j => j.railId === railId)
  })

  /**
   * レール系 Add/Update/Delete
   */

  @action
  addRail = (item: RailData) => {
    let turnoutId = null, turnoutName = ''
    // TODO: ここでやるべきか検討する
    if (RailComponentClasses[item.type].defaultProps.numConductionStates > 1) {
      turnoutId = this.nextTurnoutId
      turnoutName = `T${turnoutId}`
    }
    this.currentLayoutData.rails.push({
      ...item,
      id: this.nextRailId,
      turnoutId,
      turnoutName
    })
  }

  @action
  addRails = (items: RailData[]) => {
    items.forEach(item => this.addRail(item))
  }

  @action
  updateRail = (item: Partial<RailData>) => {
    LOGGER.info(`updateRail ${item.id}`)
    const index = this.currentLayoutData.rails.findIndex(rail => rail.id === item.id)
    const target = this.currentLayoutData.rails[index]

    // 明示的にnull指定されたらリセットする
    let opposingJoints = item.opposingJoints === null ? {} : removeEmpty({
      ...target.opposingJoints,
      ...item.opposingJoints
    })
    // 明示的にnull指定されたらリセットする
    let flowDirections = item.flowDirections === null ? {} : removeEmpty({
      ...target.flowDirections,
      ...item.flowDirections
    })

    // 中身を比較する
    // TODO: これ本当に必要？
    if (_.isEqual(opposingJoints, target.opposingJoints)) {
      opposingJoints = target.opposingJoints
    }
    if (_.isEqual(flowDirections, target.flowDirections)) {
      flowDirections = target.flowDirections
    }
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
    //次のインデックスにレイアウトデータを保存
    this.histories[this.historyIndex + 1] = this.currentLayoutData
    // 今のインデックスにレイアウトデータをクローンする
    this.histories[this.historyIndex] = toJS(this.currentLayoutData)
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
    // 古いレイアウトデータのコンフィグとの互換性を保つために、デフォルトのコンフィグとマージする
    this.config = {
      ...INITIAL_STATE.config,
      ...config
    }
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
      name: `F${this.nextFeederId}`
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

  @action
  disableAllDetectables = () => {
    const nextRails = this.currentLayoutData.rails.map(rail => {
      return {
        ...rail,
        enableJoints: false,
        enableFeederSockets: false,
        enableGapJoinerSockets: false,
      }
    })
    this.updateRails(nextRails)
  }

  /**
   * パワーユニット系 Add/Update/Delete
   */

  @action
  addPowerPack = (item: PowerPackData) => {
    // IDはここで発行
    const id = this.nextPowerPackId
    this.currentLayoutData.powerPacks.push({
      ...item,
      id: id
    })
    // コントローラー側も初期化
    TrainController.setPowerPackDirection(id, item.direction)
    TrainController.setPowerPackValue(id, item.power)
  }

  @action
  updatePowerPack = (item: Partial<PowerPackData>) => {
    const index = this.currentLayoutData.powerPacks.findIndex(feeder => feeder.id === item.id)
    const target = this.currentLayoutData.powerPacks[index]

    if (item.direction != null && item.direction !== target.direction) {
      item.power = 0
      TrainController.setPowerPackDirection(target.id, item.direction)
      if (simulatorStore.sandbox) {
        simulatorStore.sandbox.setPowerPackDirection(target.id, item.power)
      }
    } else if (item.power != null && item.power !== target.power) {
      TrainController.setPowerPackValue(target.id, item.power)
      if (simulatorStore.sandbox) {
        simulatorStore.sandbox.setPowerPackPower(target.id, item.power)
      }
    }

    this.currentLayoutData.powerPacks[index] = {
      ...target,
      ...item
    }
  }

  @action
  updatePowerPacks = (items: Partial<PowerPackData>[]) => {
    items.forEach(item => this.updatePowerPack(item))
  }

  @action
  deletePowerPack = (item: Partial<PowerPackData>) => {
    this.currentLayoutData.powerPacks = this.currentLayoutData.powerPacks.filter(feeder => feeder.id !== item.id)
  }


  /**
   * ポイントコントロールボックス系 Add/Update/Delete
   */
  @action
  addSwitcher = (item: SwitcherData) => {
    // IDはここで発行
    const id = this.nextSwitcherId
    this.currentLayoutData.switchers.push({
      ...item,
      id: id,
      conductionStates: observable({0: [], 1: [], 2: []})
    })
    TrainController.setSwitcherState(id, item.currentState)
  }

  @action
  updateSwitcher = (item: Partial<SwitcherData>) => {
    const index = this.currentLayoutData.switchers.findIndex(sw => sw.id === item.id)
    const target = this.currentLayoutData.switchers[index]

    if (item.currentState != null && item.currentState !== target.currentState) {
      TrainController.setSwitcherState(target.id, item.currentState)
      if (simulatorStore.sandbox) {
        simulatorStore.sandbox.setSwitcherDirection(target.id, item.currentState)
      }
    }

    this.currentLayoutData.switchers[index] = {
      ...target,
      ...item
    }
  }

  @action
  deleteSwitcher = (item: Partial<SwitcherData>) => {
    this.currentLayoutData.switchers = this.currentLayoutData.switchers.filter(feeder => feeder.id !== item.id)
  }

  @action
  setScript = (script: string) => {
    this.currentLayoutData.script = script
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

  getSwitcherByRailId = (id: number): SwitcherData => {
    return computed(() => this.currentLayoutData.switchers.find(sw =>
      _.flatMap(_.values(sw.conductionStates), cs => cs.slice()).find(cs => cs.railId === id)
    )).get()
  }

  getPowerPackByFeederId = (id: number): PowerPackData => {
    return computed(() => this.currentLayoutData.powerPacks.find(p => p.supplyingFeederIds.includes(id))
    ).get()
  }


  @computed
  get nextTurnoutName() {
    const ids = this.currentLayoutData.rails
      .filter(r => RailComponentClasses[r.type].defaultProps.numConductionStates > 1)
      .map(r => r.id)
    const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1
    return `T${nextId}`
  }

}


const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => (obj[key] == null) && delete obj[key]);
  return obj
}


export default new LayoutStore(INITIAL_STATE)
