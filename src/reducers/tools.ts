import {Action, handleActions} from 'redux-actions';
import * as Actions from "actions/constants"
import {Tools} from "../constants/tools";

export interface ToolsStoreState {
  activeTool: string
  authData: any
}

const initialState: ToolsStoreState = {
  activeTool: Tools.STRAIGHT_RAILS,
  authData: null,
}


export default handleActions<ToolsStoreState, any>({

  /**
   * 認証結果をセットする。
   * @param {ToolsStoreState} state
   * @param {Action<string>} action
   * @returns {{activeTool: string; authData: any}}
   */
  [Actions.SET_AUTH_DATA]: (state: ToolsStoreState, action: Action<string>): ToolsStoreState => {
    return {
      ...state,
      authData: action.payload
    }
  },
}, initialState);
