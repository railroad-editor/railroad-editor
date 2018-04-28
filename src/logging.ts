/**
 * Created by tozawa on 2017/07/17.
 */

import * as loglevel from 'loglevel'
import * as logdown from 'logdown'

// Loglevelを使う場合
function initLoglevel (name) {
  let logger = loglevel.getLogger(name)
  logger.setLevel('DEBUG')
  return logger
}

// Logdownを使う場合
// 全てのログインスタンスを有効にする
localStorage.debug = '*'
function initLogdown (name) {
  let logger = logdown(name)
  return logger
}

export default function getLogger (name) {
  // let logger = initLogdown(name);
  let logger = initLoglevel(name)

  logger.printOpts = (opts) => {
    let ary: string[] = []
    for (let [k, v] of Object.entries(opts)) {
      ary.push(`${k}: ${v}`)
    }
    logger.info(`opts: ${ary.join(', ')}`)
  }

  return logger
};
