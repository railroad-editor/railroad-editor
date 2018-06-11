import {RailComponentClasses, RailData, RailGroupData, RailItemData} from "components/rails";
import {FeederInfo, JointInfo} from "components/rails/RailBase";
import {RailGroupProps} from "components/rails/RailGroup/RailGroup";
import {action, computed, observable, reaction, when} from "mobx";
import {Tools} from "constants/tools";
import builderPaletteData from "constants/builderPaletteItems.json"
import layoutStore from "store/layoutStore";
import layoutLogicStore from "store/layoutLogicStore";
import railItems from "constants/railItems.json"


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
  presetPaletteItems: PresetPaletteItems
  // パレットで選択中のレール
  paletteItem: PaletteItem
  // 直前に選択していたレール
  lastPaletteItems: LastPaletteItems
  // Placing Mode
  placingMode: PlacingMode
  // 現在アクティブ（編集中）のレイヤーID
  activeLayerId: number
  // 仮レール（レールグループの場合は複数）
  temporaryRails: RailData[]
  // 仮レールグループ
  temporaryRailGroup: RailGroupData
  // ユーザーが登録したレールグループ
  userRailGroups: UserRailGroupData[]
  // カスタムレール
  userRails: any
  // 仮レールと他のレールが重なっているか否か
  intersects: boolean
  activeTool: string
  selecting: boolean
  temporaryFeeder: FeederInfo
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
  temporaryFeeder: null
}


export class BuilderStore {
  @observable presetPaletteItems: PresetPaletteItems
  // パレットで選択中のレール
  @observable paletteItem: PaletteItem
  // 直前に選択していたレール
  @observable lastPaletteItems: LastPaletteItems
  // Placing Mode
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

  @observable activeTool: Tools

  @observable selecting: boolean

  @observable temporaryFeeder: FeederInfo


  constructor({ presetPaletteItems, paletteItem, lastPaletteItems, placingMode, activeLayerId, temporaryRails, temporaryRailGroup, userRailGroups,
                userRails, activeTool, selecting, temporaryFeeder}) {
    this.presetPaletteItems = presetPaletteItems
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

    reaction(
      () => this.activeTool,
      (tool) => {

        this.setCursorShape(tool)

        switch (tool) {
          case Tools.FEEDERS:
            layoutLogicStore.changeToFeederMode()
            break
          case Tools.GAP_JOINERS:
            layoutLogicStore.changeToGapJoinerMode()
            break
          default:
            layoutLogicStore.changeToRailMode()
            break
        }
      }
    )
  }

  @computed
  get isRailMode() {
    return ![Tools.FEEDERS, Tools.GAP_JOINERS].includes(this.activeTool)
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
      return { railId: 0, jointId: 0 }
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

  /**
   * 指定の名前のレールの固有Propsを返す。
   * プリセットのレールに無ければユーザーカスタムレールで探して返す。
   * @param {string} name
   * @returns {any}
   */
  getRailItemData(name?: string) {
    return computed(() => {
      if (!name) {
        name = this.paletteItem.name
      }
      const presetItem = railItems.items.find(item => item.name === name)
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
      if (!name) {
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
  }

  @action
  updateTemporaryRail = (item: Partial<RailData>) => {
    const newTemporaryRails = this.temporaryRails.map(r => {
      // payloadのidと一致、もしくはpayloadが idを含まない場合
      if ((! item.id) ||  r.id === item.id) {
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
    this.setPaletteItem(paletteItem)
    this.setActiveTool(Tools.RAIL_GROUPS)
  }

  @action
  deleteUserRailGroup = (item: PaletteItem) => {
    this.userRailGroups = _.reject(this.userRailGroups, r => item.name)
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
    // カーソル形状を変更する
    switch (tool) {
      case Tools.PAN:
        document.body.style.cursor = 'move'
        break
      default:
        document.body.style.cursor = 'crosshair'
    }
  }
}


export default new BuilderStore(INITIAL_STATE)

