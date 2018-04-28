import {createAction} from 'redux-actions';
import {
  DeleteItemDataPayload,
  LayerDataPayload,
  LayoutData,
  LayoutMeta,
  PartialLayerDataPayload,
  PartialRailDataPayload,
  PartialRailGroupDataPayload,
  RailDataPayload,
  RailGroupDataPayload
} from "reducers/layout";
import * as Actions from "actions/constants";

export const addRail = createAction<RailDataPayload>(Actions.LAYOUT_ADD_RAIL)
export const updateRail = createAction<PartialRailDataPayload>(Actions.LAYOUT_UPDATE_RAIL)
export const removeRail = createAction<PartialRailDataPayload>(Actions.LAYOUT_REMOVE_RAIL)

export const addRailGroup = createAction<RailGroupDataPayload>(Actions.LAYOUT_ADD_RAIL_GROUP)
export const deleteRailGroup = createAction<PartialRailGroupDataPayload>(Actions.LAYOUT_DELETE_RAIL_GROUP)

export const addLayer = createAction<LayerDataPayload>(Actions.LAYOUT_ADD_LAYER)
export const updateLayer = createAction<PartialLayerDataPayload>(Actions.LAYOUT_UPDATE_LAYER)
export const deleteLayer = createAction<DeleteItemDataPayload>(Actions.LAYOUT_DELETE_LAYER)

export const undo = createAction<{}>(Actions.LAYOUT_UNDO)
export const redo = createAction<{}>(Actions.LAYOUT_REDO)
export const addHistory = createAction<{}>(Actions.LAYOUT_ADD_HISTORY)
export const clearHistory = createAction<{}>(Actions.LAYOUT_CLEAR_HISTORY)

export const setLayoutData = createAction<LayoutData>(Actions.LAYOUT_SET_LAYOUT_DATA)
export const setLayoutMeta = createAction<LayoutMeta>(Actions.LAYOUT_SET_LAYOUT_META)
export const updateLayoutMeta = createAction<Partial<LayoutMeta>>(Actions.LAYOUT_UPDATE_LAYOUT_META)
