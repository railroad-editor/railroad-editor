import {compose, createStore} from 'redux';
import {devToolsEnhancer} from "redux-devtools-extension";
import persistState from 'redux-localstorage'
import rootReducer from '../reducers';
import {RootState} from "./type";
import {BUILDER_SET_MARKER_POSITION, BUILDER_SET_MOUSE_POSITION, BUILDER_SET_TEMPORARY_RAIL} from "actions/constants";

export function configureStore(initialState?: RootState) {
  let store
  if (process.env.NODE_ENV === 'development') {
    store = createStore(rootReducer, initialState, compose(
      persistState('tools'),    // これが先でないとうまく動かない
      devToolsEnhancer({
        actionsBlacklist: [BUILDER_SET_MOUSE_POSITION, BUILDER_SET_MARKER_POSITION, BUILDER_SET_TEMPORARY_RAIL]
      }),
    ))
  } else {
    store = createStore(rootReducer, initialState, compose(
      persistState('tools')
    ))
  }

  if ((<any>module).hot) {
    (<any>module).hot.accept('../reducers', () => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
