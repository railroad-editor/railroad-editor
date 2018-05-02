import {Action, handleActions} from 'redux-actions';
import * as Actions from "actions/constants"
import {PaletteItem} from "store/type";
import {RailComponentClasses, RailData, RailGroupData, RailItemData} from "components/rails";
import update from "immutability-helper";
import {JointInfo} from "components/rails/RailBase";
import {RailGroupDataPayload} from "reducers/layout";
import {RailGroupProps} from "components/rails/RailGroup/RailGroup";
import {action, computed, observable} from "mobx";
import {actionFieldDecorator} from "mobx/lib/api/actiondecorator";
import {Tools} from "constants/tools";


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
  // パレットで選択中のレール
  paletteItem: PaletteItem
  // 直前に選択していたレール
  lastPaletteItems: LastPaletteItems
  // 現在アクティブ（編集中）のレイヤーID
  activeLayerId: number
  // PaperJSのロードが完了したか否か
  paperViewLoaded: boolean
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
}

export const INITIAL_STATE: BuilderStoreState = {
  paletteItem: {type: 'StraightRail', name: 'S280'},
  lastPaletteItems: {
    'Straight Rails': {type: 'StraightRail', name: 'S280'},
    'Curve Rails': {type: 'CurveRail', name: 'C280-45'},
    'Turnouts': {type: 'Turnout', name: 'PR541-15'},
    'Special Rails': {type: 'SpecialRails', name: 'End Rail'},
    'Rail Groups': {type: 'RailGroup', name: ''},
  },
  activeLayerId: 1,
  paperViewLoaded: false,
  temporaryRails: [],
  temporaryRailGroup: null,
  userRailGroups: [],
  intersects: false,
  userRails: [],
  activeTool: Tools.STRAIGHT_RAILS,
}


export class BuilderStore {
  // パレットで選択中のレール
  @observable paletteItem: PaletteItem
  // 直前に選択していたレール
  @observable lastPaletteItems: LastPaletteItems
  // 現在アクティブ（編集中）のレイヤーID
  @observable activeLayerId: number
  // PaperJSのロードが完了したか否か
  @observable paperViewLoaded: boolean
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


  constructor({ paletteItem, lastPaletteItems, activeLayerId, paperViewLoaded, temporaryRails, temporaryRailGroup, userRailGroups,
                userRails, activeTool}) {
    this.paletteItem = paletteItem
    this.lastPaletteItems = lastPaletteItems
    this.activeLayerId = activeLayerId
    this.paperViewLoaded = paperViewLoaded
    this.temporaryRails = temporaryRails
    this.temporaryRailGroup = temporaryRailGroup
    this.userRailGroups = userRailGroups
    this.userRails = userRails
    this.intersects = false
    this.activeTool = activeTool
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
    return userRailGroupData.openJoints[nextIndex]
  }

  @computed
  get nextPivotJointIndex() {
    const temporaryRails = this.temporaryRails
    if (temporaryRails.length !== 1) {
      return 0
    }
    const {type, pivotJointIndex} = temporaryRails[0]
    const {numJoints, pivotJointChangingStride} = RailComponentClasses[type].defaultProps
    return (pivotJointIndex + pivotJointChangingStride) % numJoints
  }



  @action
  setActiveTool = (tool: Tools) => {
    // カーソル形状を変更する
    switch (tool) {
      case Tools.PAN:
        document.body.style.cursor = 'move'
        break
      default:
        document.body.style.cursor = ''
    }
    this.activeTool = tool
  }


  @action
  setPaletteItem = (paletteItem: PaletteItem) => {
    this.lastPaletteItems[paletteItem.type] = this.paletteItem
    this.paletteItem = paletteItem
  }

  @action
  setActiveLayer = (layerId: number) => {
    this.activeLayerId = layerId
  }

  @action
  setPaperViewLoaded = (value: boolean) => {
    this.paperViewLoaded = value
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
  setTemporaryRailGroup = (item: RailGroupData, children: RailData[]) => {
    this.temporaryRails = children
    this.temporaryRailGroup = item
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
  setUserRails = (items: RailItemData[]) => {
    this.userRails = items
  }

  @action
  addUserRailGroup = (item: UserRailGroupData) => {
    this.userRailGroups.push(item)
    this.lastPaletteItems['Rail Groups'] = {
      type: 'RailGroup',
      name: item.name
    }
  }

  @action
  addUserRail = (item: RailItemData) => {
    this.userRails.push(item)
  }

  @action
  setIntersects = (intersects: boolean) => {
    this.intersects = intersects
  }
}


export default new BuilderStore(INITIAL_STATE)

