import {createStore, Store} from 'redux';
import {devToolsEnhancer} from "redux-devtools-extension";
import rootReducer from '../reducers';
import {RootState} from "./type";
import {BUILDER_SET_MARKER_POSITION, BUILDER_SET_MOUSE_POSITION, BUILDER_SET_TEMPORARY_RAIL} from "actions/constants";

export function configureStore(initialState?: RootState) {
  let store
  if (process.env.NODE_ENV === 'development') {
    store = createStore(rootReducer, initialState, devToolsEnhancer({
      actionsBlacklist: [BUILDER_SET_MOUSE_POSITION, BUILDER_SET_MARKER_POSITION, BUILDER_SET_TEMPORARY_RAIL]
      // actionsBlacklist: [BUILDER_SET_MOUSE_POSITION, BUILDER_SET_MARKER_POSITION]
    })) as Store<RootState>;
  } else {
    store = createStore(rootReducer, initialState) as Store<RootState>;
  }

  if ((<any>module).hot) {
    (<any>module).hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
