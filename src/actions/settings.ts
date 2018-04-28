import {createAction} from 'redux-actions';
import * as Actions from 'actions/constants';
import {SettingsStoreState} from "reducers/settings";

export const setConfig = createAction<SettingsStoreState>(Actions.SET_CONFIG);
export const updateConfig = createAction<Partial<SettingsStoreState>>(Actions.UPDATE_CONFIG)
