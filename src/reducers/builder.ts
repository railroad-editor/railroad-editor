import {Action, handleActions} from 'redux-actions';
import * as Actions from "actions/constants"
import {PaletteItem} from "store/type";
import {RailData, RailGroupData, RailItemData} from "components/rails";
import update from "immutability-helper";
import {JointInfo} from "components/rails/RailBase";
import {RailGroupDataPayload} from "reducers/layout";
import {RailGroupProps} from "components/rails/RailGroup/RailGroup";


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
  // 仮レールと他のレールが重なっているか否か
  intersects: boolean
  // カスタムレール
  userCustomRails: any
}

export const BUILDER_INITIAL_STATE: BuilderStoreState = {
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
  userCustomRails: [],
}

export default handleActions<BuilderStoreState, any>({
  /**
   * アクティブなレイヤーを変更する。
   * @param {BuilderStoreState} state
   * @param {Action<number>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_SET_ACTIVE_LAYER]: (state: BuilderStoreState, action: Action<number>): BuilderStoreState => {
    return {
      ...state,
      activeLayerId: action.payload
    }
  },

  /**
   * パレットで選択中のレールを変更する。
   * @param {BuilderStoreState} state
   * @param {Action<PaletteItem>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_SELECT_PALETTE_ITEM]: (state: BuilderStoreState, action: Action<PaletteItem>): BuilderStoreState => {
    return {
      ...state,
      paletteItem: action.payload,
      lastPaletteItems: {
        ...state.lastPaletteItems,
        [action.payload.type]: action.payload
      },
    }
  },

  /**
   * PaperJSのロード状態を変更する。
   * @param {BuilderStoreState} state
   * @param {Action<boolean>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_SET_PAPER_VIEW_LOADED]: (state: BuilderStoreState, action: Action<boolean>): BuilderStoreState => {
    return {
      ...state,
      paperViewLoaded: action.payload
    }
  },

  /**
   * 仮レールを設定する。
   * @param {BuilderStoreState} state
   * @param {Action<RailData>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_SET_TEMPORARY_RAIL]: (state: BuilderStoreState, action: Action<RailData>): BuilderStoreState => {
    return {
      ...state,
      temporaryRails: [action.payload],
      temporaryRailGroup: null
    }
  },

  /**
   * 仮レールを削除する。
   * @param {BuilderStoreState} state
   * @param {Action<RailData>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_DELETE_TEMPORARY_RAIL]: (state: BuilderStoreState, action: Action<{}>): BuilderStoreState => {
    return {
      ...state,
      temporaryRails: [],
      temporaryRailGroup: null
    }
  },

  /**
   * 仮レールを更新する。
   * payloadにidを含まない場合、全ての仮レールを更新する。
   * @param {BuilderStoreState} state
   * @param {Action<number>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_UPDATE_TEMPORARY_RAIL]: (state: BuilderStoreState, action: Action<Partial<RailData>>): BuilderStoreState => {
    const newTemporaryRails = state.temporaryRails.map(r => {
      // payloadのidと一致、もしくはpayloadが idを含まない場合
      if ((! action.payload.id) ||  r.id === action.payload.id) {
        // opposingJoints がnullか空のオブジェクトなら全削除
        let opposingJoints
        if (_.isEmpty(action.payload.opposingJoints)) {
          opposingJoints = {}
        } else {
          opposingJoints = {
            ...r.opposingJoints,
            ...action.payload.opposingJoints,
          }
        }
        // 更新
        return {
          ...r,
          ...action.payload,
          opposingJoints: opposingJoints
        }
      } else {
        // そのまま
        return r
      }
    })

    return {
      ...state,
      temporaryRails: newTemporaryRails
    }
  },

  /**
   * 仮レールグループを設定する。
   * @param {BuilderStoreState} state
   * @param {Action<RailData>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_SET_TEMPORARY_RAIL_GROUP]: (state: BuilderStoreState, action: Action<RailGroupDataPayload>): BuilderStoreState => {
    return {
      ...state,
      temporaryRails: action.payload.children,
      temporaryRailGroup: action.payload.item
    }
  },

  /**
   * 仮レールグループを更新する。
   * @param {BuilderStoreState} state
   * @param {Action<number>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_UPDATE_TEMPORARY_RAIL_GROUP]: (state: BuilderStoreState, action: Action<Partial<RailGroupData>>): BuilderStoreState => {
    return {
      ...state,
      temporaryRailGroup: {
        ...state.temporaryRailGroup,
        ...action.payload
      }
    }
  },

  /**
   * レールグループを新たに登録する。
   * @param {BuilderStoreState} state
   * @param {Action<UserRailGroupData>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_ADD_USER_RAIL_GROUP]: (state: BuilderStoreState, action: Action<UserRailGroupData>): BuilderStoreState => {
    return update(state, {
      userRailGroups: {$push: [action.payload]},
      lastPaletteItems: {
        'Rail Groups': {$set: {type: 'RailGroup', name: action.payload.name}}
      }
    })
  },

  /**
   *
   * @param {BuilderStoreState} state
   * @param {Action<boolean>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_SET_INTERSECTS]: (state: BuilderStoreState, action: Action<boolean>): BuilderStoreState => {
    return {
      ...state,
      intersects: action.payload
    }
  },

  /**
   *
   * @param {BuilderStoreState} state
   * @param {Action<boolean>} action
   * @returns {BuilderStoreState}
   */
  [Actions.BUILDER_ADD_USER_CUSTOM_RAIL]: (state: BuilderStoreState, action: Action<RailItemData>): BuilderStoreState => {
    return update(state, {
      userCustomRails: {$push: [action.payload]},
    })
  },

}, BUILDER_INITIAL_STATE);
