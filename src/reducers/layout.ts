import {Action, handleActions} from 'redux-actions';
import * as Actions from "actions/constants"
import update from 'immutability-helper';
import {RailData, RailGroupData} from "components/rails";
import * as _ from "lodash";


export interface LayoutMeta {
  id: string
  name: string
  lastModified: number
}

export interface LayoutStoreState {
  histories: LayoutData[]
  historyIndex: number
  meta: LayoutMeta
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

export interface RailDataPayload {
  item: RailData
  overwrite?: boolean
}

export interface PartialRailDataPayload {
  item: Partial<RailData>
  overwrite?: boolean
}

export interface RailGroupDataPayload {
  item: RailGroupData
  children: RailData[]
  overwrite?: boolean
}

export interface PartialRailGroupDataPayload {
  item: Partial<RailGroupData>
  overwrite?: boolean
}

export interface LayerDataPayload {
  item: LayerData
  overwrite?: boolean
}

export interface PartialLayerDataPayload {
  item: Partial<LayerData>
  overwrite?: boolean
}


export interface AddItemDataPayload<T> {
  item: T
  overwrite?: boolean
}

export interface UpdateItemDataPayload<T> {
  id: number
  item: Partial<T>
  overwrite?: boolean
}

export interface DeleteItemDataPayload {
  id: number
  overwrite?: boolean
}



export const LAYOUT_STORE_INITIAL_STATE: LayoutStoreState = {
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
}


export default handleActions<LayoutStoreState, any>({
  /**
   * レールをレイアウトに追加する。
   * @param {LayoutStoreState} state
   * @param {Action<RailDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_ADD_RAIL]: (state: LayoutStoreState, action: Action<RailDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // レイアウトを更新
    const newLayout = update(layout, {
      rails: {$push: [action.payload.item]}
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * レールを更新する。opposingJointの更新がちょっとクセがある
   * @param {LayoutStoreState} state
   * @param {Action<RailDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_UPDATE_RAIL]: (state: LayoutStoreState, action: Action<PartialRailDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // 対象のアイテムを探す
    const itemIndex = layout.rails.findIndex((item) => item.id === action.payload.item.id)
    // 見つからなかったら何もしない
    if (itemIndex === -1) {
      return state
    }
    const targetRail = layout.rails[itemIndex]

    // 対向ジョイントの更新 or 追加
    let opposingJoints = {
      ...targetRail.opposingJoints,
      ...action.payload.item.opposingJoints,
    }
    // opposingJoints がnullか空のオブジェクトなら全削除 (一部削除はできない)
    if (_.isEmpty(action.payload.item.opposingJoints)) {
      opposingJoints = {}
    }

    const newRailData = {
      ...targetRail,
      ...action.payload.item,
      opposingJoints: removeEmpty(opposingJoints)
    }
    // レイアウトを更新
    const newLayout = update(layout, {
      rails: {
        [itemIndex]: {$set: newRailData}
      }
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * レールを削除する。
   * @param {LayoutStoreState} state
   * @param {Action<RailDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_REMOVE_RAIL]: (state: LayoutStoreState, action: Action<RailDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // レールをリストから削除する
    const newRails = layout.rails.filter(item => ! (item.id === action.payload.item.id))
    // レールグループに所属していたら削除する
    const newRailGroups = layout.railGroups.map(group => {
      return {
        ...group,
        rails: group.rails.filter( r => ! (r === action.payload.item.id))
      }
    })

    // レイアウトを更新
    const newLayout = {
      ...layout,
      rails: newRails,
      railGroups: newRailGroups
    }
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * レールグループをレイアウトに追加する。
   * @param {LayoutStoreState} state
   * @param {Action<RailDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_ADD_RAIL_GROUP]: (state: LayoutStoreState, action: Action<RailGroupDataPayload>) => {
    const layout = state.histories[state.historyIndex]

    // 各レールにグループIDを付与する
    const children = action.payload.children.map(c => {
      return {
        ...c,
        groupId: action.payload.item.id
      }
    })

    const newRailGroup = {
      ...action.payload.item,
      rails: children.map(c => c.id)
    }

    // レイアウトを更新
    const newLayout = update(layout, {
      rails: {$push: children},
      railGroups: {$push: [newRailGroup]}
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * レールグループをレイアウトから削除する。所属するレールも一緒に削除される。
   * @param {LayoutStoreState} state
   * @param {Action<RailDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_DELETE_RAIL_GROUP]: (state: LayoutStoreState, action: Action<PartialRailGroupDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // 対象のレールグループを探す
    const itemIndex = layout.railGroups.findIndex((item) => item.id === action.payload.item.id)
    // 見つからなかったら何もしない
    if (itemIndex === -1) {
      return state
    }
    // 対象のレールグループに所属しないレールを探す
    const children = layout.rails.filter(r => ! (r.groupId === layout.railGroups[itemIndex].id))

    // レイアウトを更新
    const newLayout = update(layout, {
      rails: {$set: children},
      railGroups: {$splice: [[itemIndex, 1]]}
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },



  /**
   * レイヤーをレイアウトに追加する。
   * @param {LayoutStoreState} state
   * @param {Action<RailDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_ADD_LAYER]: (state: LayoutStoreState, action: Action<LayerDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // レイアウトを更新
    const newLayout = update(layout, {
      layers: {$push: [action.payload.item]}
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * レイヤーを更新する。
   * @param {LayoutStoreState} state
   * @param {Action<LayerDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_UPDATE_LAYER]: (state: LayoutStoreState, action: Action<LayerDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // 対象のアイテムを探す
    const itemIndex = layout.layers.findIndex((item) => item.id === action.payload.item.id)
    // 見つからなかったら何もしない
    if (itemIndex === -1) {
      return state
    }
    const targetLayer = layout.layers[itemIndex]
    const newLayerData = {
      ...targetLayer,
      ...action.payload.item
    }
    // レイアウトを更新
    const newLayout = update(layout, {
      layers: {
        [itemIndex]: {$set: newLayerData}
      }
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * レイヤーを削除する。
   * @param {LayoutStoreState} state
   * @param {Action<LayerDataPayload>} action
   * @returns {*}
   */
  [Actions.LAYOUT_DELETE_LAYER]: (state: LayoutStoreState, action: Action<DeleteItemDataPayload>) => {
    const layout = state.histories[state.historyIndex]
    // 対象のアイテムを探す
    const layerIndex = layout.layers.findIndex(layer => layer.id === action.payload.id)
    // 見つからなかったら何もしない
    if (layerIndex === -1) {
      return state
    }
    // レイヤーに所属しないレール
    const rails = layout.rails.filter(rail => rail.layerId !== action.payload.id)

    // レイアウトを更新
    const newLayout = update(layout, {
      layers: {$splice: [[layerIndex, 1]]},
      rails: {$set: rails}
    })
    // ヒストリを更新
    return addHistory(state, newLayout, action.payload.overwrite)
  },

  /**
   * 一個前のヒストリに戻る。
   * @param {LayoutStoreState} state
   * @param {Action<{}>} action
   * @returns {any}
   */
  [Actions.LAYOUT_UNDO]: (state: LayoutStoreState, action: Action<{}>) => {
    if (state.historyIndex > 0) {
      return {
        ...state,
        historyIndex: state.historyIndex - 1
      }
    } else {
      return state
    }
  },

  /**
   * 一個先のヒストリに進む。
   * @param {LayoutStoreState} state
   * @param {Action<{}>} action
   * @returns {any}
   */
  [Actions.LAYOUT_REDO]: (state: LayoutStoreState, action: Action<{}>) => {
    if (state.histories.length > 1 && state.historyIndex < state.histories.length - 1) {
      return {
        ...state,
        historyIndex: state.historyIndex + 1
      }
    } else {
      return state
    }
  },

  /**
   * 現在のレイアウトデータを明示的にヒストリに追加する。
   * @param {LayoutStoreState} state
   * @param {Action<{}>} action
   */
  [Actions.LAYOUT_ADD_HISTORY]: (state: LayoutStoreState, action: Action<{}>) => {
    const layout = state.histories[state.historyIndex]
    return addHistory(state, layout, false)
  },

  /**
   * 全てのヒストリを削除する。
   * @param {LayoutStoreState} state
   * @param {Action<{}>} action
   * @returns {{histories: LayoutData[]; historyIndex: number}}
   */
  [Actions.LAYOUT_CLEAR_HISTORY]: (state: LayoutStoreState, action: Action<{}>) => {
    return {
      ...state,
      historyIndex: 0
    }
  },

  [Actions.LAYOUT_SET_LAYOUT_META]: (state: LayoutStoreState, action: Action<LayoutMeta>): LayoutStoreState => {
    return {
      ...state,
      meta: action.payload
    }
  },

  [Actions.LAYOUT_UPDATE_LAYOUT_META]: (state: LayoutStoreState, action: Action<Partial<LayoutMeta>>): LayoutStoreState => {
    return {
      ...state,
      meta: {
        ...state.meta,
        ...action.payload
      }
    }
  },


  [Actions.LAYOUT_SET_LAYOUT_DATA]: (state: LayoutStoreState, action: Action<LayoutData>) => {
    return {
      ...state,
      histories: [action.payload],
      historyIndex: 0
    }
  },

}, LAYOUT_STORE_INITIAL_STATE);


const addHistory = (state: LayoutStoreState, layout: LayoutData, overwrite = false) => {
  if (overwrite) {
    // 最新のヒストリを上書きする
    return update(state, {
      histories: {
        $splice: [[state.historyIndex, 1, layout]],
      },
    })
  } else {
    // ヒストリ配列の末尾に追加する
    return update(state, {
      histories: {
        $splice: [[state.historyIndex + 1, 1, layout]],
      },
      historyIndex: {$set: state.historyIndex + 1},
    })
  }
}

const removeEmpty = (obj) => {
  Object.keys(obj).forEach((key) => (obj[key] == null) && delete obj[key]);
  return obj
}

const getAllIndexes = (arr, val) => {
  var indexes = [], i;
  for(i = 0; i < arr.length; i++)
    if (arr[i] === val)
      indexes.push(i);
  return indexes;
}