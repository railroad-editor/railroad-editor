import {SKYWAY_API_KEY} from "constants/tools";
import Peer from 'skyway-js';
import SessionAPI from "apis/session"
import getLogger from "logging";
import waitUntil from 'async-wait-until';
import {TrainControllerConfig} from "store/layoutStore";

const LOGGER = getLogger(__filename)

export class SessionError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, SessionError)
  }
}

export class PeerError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, PeerError)
  }
}

export class ConnectionError extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, ConnectionError)
  }
}

class TrainController {
  peer: Peer
  peerId: string
  conn: any

  connect = async (username: string, layoutId: string) => {
    // Controller CLIがセッションを作成済みか調べる
    let session: any = await SessionAPI.fetchSession(username, layoutId)
      .catch((err) => {
        LOGGER.error(err)
        throw new SessionError(err)
      })

    if (! session) {
      return
    }

    this.peer = new Peer({
      key: SKYWAY_API_KEY,
      debug: 3,
    });

    this.peer.on('open', id => {
      this.peerId = id
      LOGGER.info('This peer ID:', this.peerId)
    })
    this.peer.on('error', err => {
      LOGGER.error(err)
      throw new PeerError(err)
    })

    // wait until peer is open
    await waitUntil(() => {
      return this.peer.open;
    })

    this.conn = this.peer.connect(session.peerId)

    this.conn.once('open', () => {
      const remoteId = this.conn.remoteId;
      LOGGER.info(`Connection opened. Remote Peer ID: ${remoteId}`);
      LOGGER.info('Remote Peer ID', remoteId);
    });

    this.conn.on('data', data => {
      LOGGER.info(`Remote data: ${data}\n`);
    });

    this.conn.once('close', () => {
      LOGGER.info('Connection closed.');
    });

    this.conn.on('error', err => {
      LOGGER.error(err);
      throw new ConnectionError(err)
    });

    // wait until connection is open
    await waitUntil(() => {
      return this.conn.open;
    })
  }

  configure = (config: TrainControllerConfig) => {
    this.send(`config ${JSON.stringify(config)}`)
  }

  setPowerPackValue = (powerPackId: number, value: number) => {
    this.send(`p ${powerPackId} v ${value}`)
  }

  setPowerPackDirection = (powerPackId: number, direction: boolean) => {
    this.send(`p ${powerPackId} d ${Number(direction)}`)
  }

  togglePowerDirection = (powerPackId: number) => {
    this.send(`p ${powerPackId} d`)
  }

  setSwitcherState = (switcherId: number, state: number) => {
    this.send(`s ${switcherId} d ${state}`)
  }

  toggleSwitcherState = (switcherId: number) => {
    this.send(`s ${switcherId} d`)
  }

  private send = (data: string) => {
    if (! this.conn) {
      LOGGER.warn(`Not connected yet. data: ${data}`)
      return
    }

    LOGGER.info(`Sending data: ${data}`)
    this.conn.send(data)
  }
}


export default new TrainController()