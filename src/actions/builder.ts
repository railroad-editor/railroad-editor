import {createAction} from 'redux-actions';
import * as Actions from "actions/constants";
import {PaletteItem} from "store/type";
import {Point} from "paper";
import {UserRailGroupData} from "reducers/builder";
import {RailData, RailGroupData, RailItemData} from "components/rails";
import {RailGroupDataPayload} from "reducers/layout";

export const selectPaletteItem = createAction<PaletteItem>(Actions.BUILDER_SELECT_PALETTE_ITEM);
export const setPaletteMode = createAction<string>(Actions.SET_PALETTE_MODE);
export const setActiveLayer = createAction<number>(Actions.BUILDER_SET_ACTIVE_LAYER);
export const setMousePosition = createAction<Point>(Actions.BUILDER_SET_MOUSE_POSITION);
export const setPaperViewLoaded = createAction<boolean>(Actions.BUILDER_SET_PAPER_VIEW_LOADED);

export const setTemporaryRail = createAction<RailData>(Actions.BUILDER_SET_TEMPORARY_RAIL);
export const updateTemporaryItem = createAction<Partial<RailData>>(Actions.BUILDER_UPDATE_TEMPORARY_RAIL);
export const deleteTemporaryRail = createAction<{}>(Actions.BUILDER_DELETE_TEMPORARY_RAIL);
export const setTemporaryRailGroup = createAction<RailGroupDataPayload>(Actions.BUILDER_SET_TEMPORARY_RAIL_GROUP);
export const updateTemporaryRailGroup = createAction<Partial<RailGroupData>>(Actions.BUILDER_UPDATE_TEMPORARY_RAIL_GROUP);
export const setIntersects = createAction<boolean>(Actions.BUILDER_SET_INTERSECTS)

export const addUserRailGroup = createAction<UserRailGroupData>(Actions.BUILDER_ADD_USER_RAIL_GROUP)
export const addUserCustomRail = createAction<RailItemData>(Actions.BUILDER_ADD_USER_CUSTOM_RAIL)
