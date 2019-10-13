import {RailComponentClasses} from "containers/rails";
import {action, computed, observable} from "mobx";
import {Tools} from "constants/tools";
import builderPaletteData from "constants/railPaletteItems.json"
import railPaletteItems from "constants/railPaletteItems.json"
import layoutStore from "stores/layoutStore";
import {reactionWithOldValue} from "./utils";
import {FeederInfo} from "react-rail-components";
import {
  LastPaletteItems,
  PaletteItem,
  PresetPaletteItemsByVendor,
  RailData,
  RailGroupData,
  RailItemData
} from "./types";


export interface BuilderStoreState {
  presetPaletteItems: PresetPaletteItemsByVendor
  paletteItem: PaletteItem
  lastPaletteItems: LastPaletteItems
  placingMode: PlacingMode
  temporaryRails: RailData[]
  temporaryRailGroup: RailGroupData
  userRailGroups: RailGroupData[]
  userRails: any
  intersects: boolean
  activeTool: string
  selecting: boolean
  temporaryFeeder: FeederInfo
  adjustmentAngle: number
  currentJointId: number
  currentRailId: number
}

export enum PlacingMode {
  FREE = 'Free Placing Mode',
  JOINT = 'Joint Placing Mode'
}

export const INITIAL_STATE: BuilderStoreState = {
  presetPaletteItems: builderPaletteData,
  paletteItem: {type: 'StraightRail', name: 'S280'},
  lastPaletteItems: {
    [Tools.STRAIGHT_RAILS]: {type: 'StraightRail', name: 'S280'},
    [Tools.CURVE_RAILS]: {type: 'CurveRail', name: 'C280-45'},
    [Tools.TURNOUTS]: {type: 'Turnout', name: 'PR541-15'},
    [Tools.SPECIAL_RAILS]: {type: 'SpecialRails', name: 'End Rail'},
    [Tools.RAIL_GROUPS]: {type: 'RailGroup', name: ''},
    [Tools.FEEDERS]: {type: 'Feeder', name: 'Feeder'},
    [Tools.GAP_JOINERS]: {type: 'GapJoiner', name: 'GapJoiner'},
  },
  placingMode: PlacingMode.FREE,
  temporaryRails: [],
  temporaryRailGroup: null,
  userRailGroups: [],
  intersects: false,
  userRails: [],
  activeTool: null,   // 後でreactionを起こさせるためにここではnullにしておく
  selecting: false,
  temporaryFeeder: null,
  adjustmentAngle: 0,
  currentJointId: null,
  currentRailId: null
}


/**
 * Builderモードに特有のUIの状態を保持し、操作するStore
 */
export class BuilderStore {
  // パレットで選択中のアイテム
  @observable paletteItem: PaletteItem
  // パレット切替の直前に選択していたアイテム
  @observable lastPaletteItems: LastPaletteItems
  // レール設置モード
  @observable placingMode: PlacingMode
  // 仮レール（レールグループの場合は複数）
  @observable temporaryRails: RailData[]
  // 仮レールグループ
  @observable temporaryRailGroup: RailGroupData
  // 仮レールと他のレールが重なっているか否か
  @observable intersects: boolean
  // カスタムレール
  @observable userRails: RailItemData[]
  // ユーザーが登録したレールグループ
  @observable userRailGroups: RailGroupData[]
  // 現在アクティブなツール（パレット）
  @observable activeTool: Tools
  // 矩形選択中か否か
  @observable selecting: boolean
  // 仮フィーダー
  @observable temporaryFeeder: FeederInfo
  // [角度微調整機能] レール設置時の微調整角度
  @observable adjustmentAngle: number
  // 現在仮レールを表示しているジョイントのID
  @observable currentJointId: number
  // 現在仮レールを表示しているジョイントを持つレールのID
  @observable currentRailId: number

  constructor({
                paletteItem, lastPaletteItems, placingMode, temporaryRails, temporaryRailGroup, userRailGroups,
                userRails, activeTool, selecting, temporaryFeeder,
                adjustmentAngle, currentJointId, currentRailId
              }) {
    this.paletteItem = paletteItem
    this.lastPaletteItems = lastPaletteItems
    this.placingMode = placingMode
    this.temporaryRails = temporaryRails
    this.temporaryRailGroup = temporaryRailGroup
    this.userRailGroups = userRailGroups
    this.userRails = userRails
    this.intersects = false
    this.activeTool = activeTool
    this.selecting = selecting
    this.temporaryFeeder = temporaryFeeder
    this.adjustmentAngle = adjustmentAngle
    this.currentJointId = currentJointId
    this.currentRailId = currentRailId


    reactionWithOldValue(
      () => layoutStore.currentLayoutData.rails.length,
      (newValue, oldValue) => {
        if (newValue === 0) {
          // レイアウトが空ならFree Placing Mode
          this.setPlacingMode(PlacingMode.FREE)
        } else if (newValue > 0 && oldValue === 0) {
          // 最初のレールを置いたらJoint Placing Modeに自動的に移行する
          this.setPlacingMode(PlacingMode.JOINT)
        }
      }
    )
  }


  @computed
  get usingRailTools() {
    return [Tools.STRAIGHT_RAILS, Tools.CURVE_RAILS, Tools.TURNOUTS, Tools.SPECIAL_RAILS, Tools.RAIL_GROUPS].includes(this.activeTool)
  }

  @computed
  get paletteRailGroupData() {
    const {type, name} = this.paletteItem
    if (type !== 'RailGroup' && name) {
      return null
    }
    return _.clone(this.userRailGroups.find(rg => rg.name === name))
  }

  @computed
  get nextPivotJointInfo() {
    const temporaryRailGroup = this.temporaryRailGroup
    const userRailGroupData = this.paletteRailGroupData
    if (! (temporaryRailGroup && userRailGroupData)) {
      return {railId: 0, jointId: 0}
    }
    const currentIndex = _.indexOf(userRailGroupData.openJoints, temporaryRailGroup.pivotJointInfo)
    const nextIndex = (currentIndex + 1) % userRailGroupData.openJoints.length
    if (this.placingMode === PlacingMode.FREE && nextIndex <= currentIndex) {
      return undefined
    }
    return userRailGroupData.openJoints[nextIndex]
  }

  @computed
  get nextPivotJointIndex() {
    const temporaryRails = this.temporaryRails
    if (temporaryRails.length !== 1) {
      return undefined
    }
    let {type, pivotJointIndex} = temporaryRails[0]
    if (_.isNil(pivotJointIndex)) {
      return 0
    }
    const {numJoints, pivotJointChangingStride} = RailComponentClasses[type].defaultProps
    const nextPivotJointIndex = (pivotJointIndex + pivotJointChangingStride) % numJoints
    if (this.placingMode === PlacingMode.FREE && nextPivotJointIndex <= pivotJointIndex) {
      return undefined
    }
    return nextPivotJointIndex
  }

  @computed
  get presetRailPaletteItems() {
    return railPaletteItems[layoutStore.config.railSetName]
  }


  /**
   * 指定の名前のレールの固有Propsを返す。
   * プリセットのレールに無ければユーザーカスタムレールで探して返す。
   * @param {string} name
   * @returns {any}
   */
  getRailItemData(name?: string): RailData {
    return computed(() => {
      if (! name) {
        name = this.paletteItem.name
      }
      const presetItem = layoutStore.presetRailItems.items.find(item => item.name === name)
      if (presetItem) {
        return presetItem
      }
      const customRail = this.userRails.find(item => item.name === name)
      if (customRail) {
        return customRail
      }
      return null

    }).get()
  }

  /**
   * 指定の名前のユーザー登録済みレールグループデータを返す。
   * @param {string} name
   * @returns {any}
   */
  getRailGroupItemData = (name?: string): RailGroupData => {
    return computed(() => {
      if (! name) {
        name = this.paletteItem.name
        if (this.paletteItem.type !== 'RailGroup') {
          return null
        }
      }
      const ret = this.userRailGroups.find(rg => rg.name === name)
      if (ret) {
        return ret
      }
      return null
    }).get()
  }


  @action
  setPlacingMode = (placingMode: PlacingMode) => {
    this.placingMode = placingMode
  }

  @action
  setActiveTool = (tool: Tools) => {
    this.lastPaletteItems[this.activeTool] = this.paletteItem
    this.activeTool = tool
  }

  @action
  setPaletteItem = (paletteItem: PaletteItem) => {
    this.paletteItem = paletteItem
  }

  @action
  setTemporaryRail = (item: RailData) => {
    this.temporaryRails = [item]
    this.temporaryRailGroup = null
  }

  @action
  deleteTemporaryRail = () => {
    this.temporaryRails = []
    this.temporaryRailGroup = null
    this.intersects = false
  }

  @action
  updateTemporaryRail = (item: Partial<RailData>) => {
    const newTemporaryRails = this.temporaryRails.map(r => {
      // payloadのidと一致、もしくはpayloadが idを含まない場合
      if ((! item.id) || r.id === item.id) {
        // opposingJoints がnullか空のオブジェクトなら全削除
        let opposingJoints
        if (_.isEmpty(item.opposingJoints)) {
          opposingJoints = {}
        } else {
          opposingJoints = {
            ...r.opposingJoints,
            ...item.opposingJoints,
          }
        }
        // マージ
        return {
          ...r,
          ...item,
          opposingJoints: opposingJoints
        }
      } else {
        // 変更なし
        return r
      }
    })

    this.temporaryRails = newTemporaryRails
  }

  @action
  setTemporaryFeeder = (feederInfo: FeederInfo) => {
    this.temporaryFeeder = feederInfo
  }

  @action
  deleteTemporaryFeeder = () => {
    this.temporaryFeeder = null
  }

  @action
  updateTemporaryFeeder = (feederInfo: Partial<FeederInfo>) => {
    this.temporaryFeeder = {
      ...this.temporaryFeeder,
      ...feederInfo
    }
  }

  @action
  setTemporaryRailGroup = (item: RailGroupData, children: RailData[]) => {
    this.temporaryRails = children
    this.temporaryRailGroup = item
    this.temporaryRailGroup.rails = children
  }

  @action
  updateTemporaryRailGroup = (item: Partial<RailGroupData>) => {
    this.temporaryRailGroup = {
      ...this.temporaryRailGroup,
      ...item
    }
  }

  @action
  setUserRailGroups = (items: RailGroupData[]) => {
    this.userRailGroups = items
    if (items.length > 0) {
      this.lastPaletteItems['Rail Groups'] = {
        type: 'RailGroup',
        name: items[0].name
      }
    }
  }

  @action
  addUserRailGroup = (item: RailGroupData) => {
    // 同じ名前のレールグループが居たら上書きする
    const idx = this.userRailGroups.findIndex(rg => rg.name === item.name)
    if (idx >= 0) {
      this.userRailGroups[idx] = item
    } else {
      this.userRailGroups.push(item)
    }
    // レールグループ作成後はパレットレールとして選択する
    const paletteItem = {
      type: 'RailGroup',
      name: item.name
    }
    this.setActiveTool(Tools.RAIL_GROUPS)
    this.setPaletteItem(paletteItem)
  }

  @action
  deleteUserRailGroup = (name: string) => {
    this.userRailGroups = _.reject(this.userRailGroups, r => name === r.name)
  }

  @action
  setUserRails = (items: RailItemData[]) => {
    this.userRails = items
  }

  @action
  addUserRail = (item: RailItemData) => {
    this.userRails.push(item)
  }

  @action
  deleteUserRail = (name: string) => {
    this.userRails = _.reject(this.userRails, r => name === r.name)
  }

  @action
  setIntersects = (intersects: boolean) => {
    this.intersects = intersects
  }

  @action
  setSelecting = (selecting: boolean) => {
    this.selecting = selecting
  }

  @action
  setCursorShape = (tool: Tools) => {
    document.body.style.cursor = 'crosshair'
  }

  @action
  setAdjustmentAngle = (angle: number) => {
    this.adjustmentAngle = angle
  }

  @action
  setCurrentJoint = (railId: number, jointId: number) => {
    this.currentRailId = railId
    this.currentJointId = jointId
  }
}


export default new BuilderStore(INITIAL_STATE)

