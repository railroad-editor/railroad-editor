import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

window.RAIL_COMPONENTS = {}
window.RAIL_GROUP_COMPONENTS = {}


const EVENTS_TO_MODIFY = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'wheel'];

// @ts-ignore
const originalAddEventListener = document.addEventListener.bind();
// @ts-ignore
document.addEventListener = (type, listener, options, wantsUntrusted) => {
  let modOptions = options;
  if (EVENTS_TO_MODIFY.includes(type)) {
    if (typeof options === 'boolean') {
      modOptions = {
        capture: options,
        passive: false,
      };
    } else if (typeof options === 'object') {
      modOptions = {
        ...options,
        passive: false,
      };
    }
  }

  return originalAddEventListener(type, listener, modOptions, wantsUntrusted);
};

// @ts-ignore
const originalRemoveEventListener = document.removeEventListener.bind();
document.removeEventListener = (type, listener, options) => {
  let modOptions = options;
  if (EVENTS_TO_MODIFY.includes(type)) {
    if (typeof options === 'boolean') {
      modOptions = {
        capture: options,
        passive: false,
      };
    } else if (typeof options === 'object') {
      modOptions = {
        ...options,
        passive: false,
      };
    }
  }
  return originalRemoveEventListener(type, listener, modOptions);
};

ReactDOM.render(<App/>, document.getElementById('root'))
registerServiceWorker()
