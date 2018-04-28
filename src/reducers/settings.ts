import {Action, handleActions} from 'redux-actions';
import * as Actions from "actions/constants"
import {DEFAULT_GRID_SIZE, DEFAULT_INITIAL_ZOOM, DEFAULT_PAPER_HEIGHT, DEFAULT_PAPER_WIDTH} from "constants/tools";


export interface SettingsStoreState {
  paperWidth: number
  paperHeight: number
  gridSize: number
  initialZoom: number
}

const initialState: SettingsStoreState = {
  paperWidth: DEFAULT_PAPER_WIDTH,
  paperHeight: DEFAULT_PAPER_HEIGHT,
  gridSize: DEFAULT_GRID_SIZE,
  initialZoom: DEFAULT_INITIAL_ZOOM
}


export default handleActions<SettingsStoreState, any>({
  [Actions.SET_CONFIG]: (state: SettingsStoreState, action: Action<SettingsStoreState>): SettingsStoreState => {
    return action.payload
  },

  /**
   * 認証結果をセットする。
   * @param {SettingsStoreState} state
   * @param {Action<string>} action
   * @returns {{activeTool: string; authData: any}}
   */
  [Actions.UPDATE_CONFIG]: (state: SettingsStoreState, action: Action<Partial<SettingsStoreState>>): SettingsStoreState => {
    return {
      ...state,
      ...action.payload
    }
  }
}, initialState);
