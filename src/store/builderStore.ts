import {RailComponentClasses, RailData, RailGroupData, RailItemData} from "components/rails";
import {action, computed, observable, reaction, runInAction} from "mobx";
import {Tools} from "constants/tools";
import builderPaletteData from "constants/railPaletteItems.json"
import railPaletteItems from "constants/railPaletteItems.json"
import layoutLogicStore from "store/layoutLogicStore";
import layoutStore from "store/layoutStore";
import {reactionWithOldValue} from "./utils";
import {getCloseJointsOf, intersectsOf} from "../components/rails/utils";
import {FeederInfo, JointInfo, RailGroupProps} from "react-rail-components";


export interface PresetPaletteItemsByVendor {
  [key: string]: PresetPaletteItems
}

export interface PresetPaletteItems {
  [key: string]: PaletteItem[]
}

export interface LastPaletteItems {
  [key: string]: PaletteItem
}

export interface UserRailGroupData extends RailGroupProps {
  // レールグループを構成するレール
  rails: RailData[]
  // レールグループで未接続のジョイント
  openJoints: JointInfo[]
}


export interface BuilderStoreState {
  presetPaletteItems: PresetPaletteItemsByVendor
  paletteItem: PaletteItem
  lastPaletteItems: LastPaletteItems
  placingMode: PlacingMode
  activeLayerId: number
  temporaryRails: RailData[]
  temporaryRailGroup: RailGroupData
  userRailGroups: UserRailGroupData[]
  userRails: any
  intersects: boolean
  activeTool: string
  selecting: boolean
  temporaryFeeder: FeederInfo
  freePlacingDialog: boolean
  freePlacingPosition: Point2D
  clickedJointPosition: Point2D
  measureStartPosition: Point2D
  measureEndPosition: Point2D
  measuredDistance: Point2D
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
  activeLayerId: 1,
  temporaryRails: [],
  temporaryRailGroup: null,
  userRailGroups: [],
  intersects: false,
  userRails: [],
  activeTool: null,   // 後でreactionを起こさせるためにここではnullにしておく
  selecting: false,
  temporaryFeeder: null,
  freePlacingDialog: false,
  freePlacingPosition: {x: 0, y: 0},
  clickedJointPosition: {x: 0, y: 0},
  measureStartPosition: null,
  measureEndPosition: null,
  measuredDistance: null,
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
  // 現在アクティブ（編集中）のレイヤーID
  @observable activeLayerId: number
  // 仮レール（レールグループの場合は複数）
  @observable temporaryRails: RailData[]
  // 仮レールグループ
  @observable temporaryRailGroup: RailGroupData
  // 仮レールと他のレールが重なっているか否か
  @observable intersects: boolean
  // カスタムレール
  @observable userRails: any
  // ユーザーが登録したレールグループ
  @observable userRailGroups: UserRailGroupData[]
  // 現在アクティブなツール（パレット）
  @observable activeTool: Tools
  // 矩形選択中か否か
  @observable selecting: boolean
  // 仮フィーダー
  @observable temporaryFeeder: FeederInfo
  // [自由配置モード] ジョイントをクリックした際のレール位置入力ダイアログ表示
  @observable freePlacingDialog: boolean
  // [自由配置モード] ジョイントをクリックした際に入力した位置差分
  @observable freePlacingDifference: Point2D
  // [自由配置モード] クリックされたジョイントの位置
  @observable clickedJointPosition: Point2D
  // [メジャーツール] 測定を開始した位置
  @observable measureStartPosition: Point2D
  // [メジャーツール] 測定を終了した位置
  @observable measureEndPosition: Point2D
  // [角度微調整機能] レール設置時の微調整角度
  @observable adjustmentAngle: number
  // 現在仮レールを表示しているジョイントのID
  @observable currentJointId: number
  // 現在仮レールを表示しているジョイントを持つレールのID
  @observable currentRailId: number

  constructor({
                paletteItem, lastPaletteItems, placingMode, activeLayerId, temporaryRails, temporaryRailGroup, userRailGroups,
                userRails, activeTool, selecting, temporaryFeeder, freePlacingDialog, freePlacingPosition, clickedJointPosition,
                measureStartPosition, measureEndPosition, adjustmentAngle, currentJointId, currentRailId
              }) {
    this.paletteItem = paletteItem
    this.lastPaletteItems = lastPaletteItems
    this.placingMode = placingMode
    this.activeLayerId = activeLayerId
    this.temporaryRails = temporaryRails
    this.temporaryRailGroup = temporaryRailGroup
    this.userRailGroups = userRailGroups
    this.userRails = userRails
    this.intersects = false
    this.activeTool = activeTool
    this.selecting = selecting
    this.temporaryFeeder = temporaryFeeder
    this.freePlacingDialog = freePlacingDialog
    this.freePlacingDifference = freePlacingPosition
    this.clickedJointPosition = clickedJointPosition
    this.measureStartPosition = measureStartPosition
    this.measureEndPosition = measureEndPosition
    this.adjustmentAngle = adjustmentAngle
    this.currentJointId = currentJointId
    this.currentRailId = currentRailId

    // ツール変更時
    reaction(
      () => this.activeTool,
      (tool) => {
        this.changeMode(tool)
      }
    )

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

  @action
  changeMode = (tool: Tools) => {
    this.setCursorShape(tool)
    switch (tool) {
      case Tools.FEEDERS:
        layoutLogicStore.changeToFeederMode()
        break
      case Tools.GAP_JOINERS:
        layoutLogicStore.changeToGapJoinerMode()
        break
      case Tools.MEASURE:
        runInAction(() => {
          this.setMeasureStartPosition(null)
          this.setMeasureEndPosition(null)
        })
        break
      default:
        layoutLogicStore.changeToRailMode()
        break
    }
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
   * 仮レールが他のレールと衝突しているか否かを判定する
   */
  @action
  checkIntersections() {
    const {temporaryRails} = this
    const {currentLayoutData, activeLayerRails} = layoutStore

    const jointsCloseToTempRail = _.flatMap(temporaryRails, r => getCloseJointsOf(r.id, currentLayoutData.rails))
    // const closeJointPairForTempRail = this.props.layout.unconnectedCloseJoints.filter(ji => ji.from.railId === -1)
    const targetRailIds = _.without(activeLayerRails.map(rail => rail.id), ...jointsCloseToTempRail.map(j => j.to.railId))
    const intersects = temporaryRails.map(r => intersectsOf(r.id, targetRailIds)).some(e => e)
    this.setIntersects(intersects)
  }

  /**
   * 指定の名前のレールの固有Propsを返す。
   * プリセットのレールに無ければユーザーカスタムレールで探して返す。
   * @param {string} name
   * @returns {any}
   */
  getRailItemData(name?: string) {
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
  getRailGroupItemData = (name?: string) => {
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
  setActiveLayer = (layerId: number) => {
    this.activeLayerId = layerId
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
    this.temporaryRailGroup.rails = children.map(c => c.id)
  }

  @action
  updateTemporaryRailGroup = (item: Partial<RailGroupData>) => {
    this.temporaryRailGroup = {
      ...this.temporaryRailGroup,
      ...item
    }
  }

  @action
  setUserRailGroups = (items: UserRailGroupData[]) => {
    this.userRailGroups = items
    if (items.length > 0) {
      this.lastPaletteItems['Rail Groups'] = {
        type: 'RailGroup',
        name: items[0].name
      }
    }
  }

  @action
  addUserRailGroup = (item: UserRailGroupData) => {
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
  deleteUserRailGroup = (item: PaletteItem) => {
    this.userRailGroups = _.reject(this.userRailGroups, r => r.name === item.name)
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
  deleteUserRail = (item: RailItemData) => {
    this.userRails = _.reject(this.userRails, r => item.name === r.name && item.type === r.type)
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
  setFreePlacingDialog = (open: boolean) => {
    this.freePlacingDialog = open
  }

  @action
  setFreePlacingDifference = (position: Point2D) => {
    this.freePlacingDifference = position
  }

  @action
  setClickedJointPosition = (position: Point2D) => {
    this.clickedJointPosition = position
  }

  @action
  setMeasureStartPosition = (position: Point2D) => {
    this.measureStartPosition = position
  }

  @action
  setMeasureEndPosition = (position: Point2D) => {
    this.measureEndPosition = position
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

