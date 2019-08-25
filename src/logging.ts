/**
 * Created by tozawa on 2017/07/17.
 */

import * as loglevel from 'loglevel'

// Loglevelを使う場合
function initLoglevel(name) {
  let logger = loglevel.getLogger(name)
  if (process.env.REACT_APP_ENV === 'beta') {
    logger.setLevel('DEBUG')
  } else {
    logger.setLevel('INFO')
  }
  return logger
}

export default function getLogger(name) {
  // let logger = initLogdown(name);
  let logger = initLoglevel(name)
  return logger
};
