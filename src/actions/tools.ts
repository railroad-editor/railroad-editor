import {createAction} from 'redux-actions';
import * as Actions from 'actions/constants';

export const setTool = createAction<string>(Actions.SET_TOOL);
export const setAuthData = createAction<any>(Actions.SET_AUTH_DATA)
