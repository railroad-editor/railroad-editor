import * as loglevel from 'loglevel'

// Loglevelを使う場合
function initLoglevel(name) {
  let logger = loglevel.getLogger(name)
  logger.setLevel('INFO')
  return logger
}

export default function getLogger(name) {
  let logger = initLoglevel(name)
  return logger
};
