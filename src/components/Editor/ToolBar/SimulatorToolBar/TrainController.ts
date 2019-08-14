import {SKYWAY_API_KEY} from "constants/tools";
import Peer from 'skyway-js';
import SessionAPI from "apis/session"
import getLogger from "logging";
import * as waitUntil from 'async-wait-until';
import {TrainControllerConfig} from "store/layoutStore";

const LOGGER = getLogger(__filename)

class TrainController {
  peer: Peer
  peerId: string
  conn: any

  connect = async (username: string, layoutId: string) => {
    // Controller CLIがセッションを作成済みか調べる
    let session: any = await SessionAPI.fetchSession(username, layoutId)
      .catch((reason) => {
        // this.props.snackbar.showMessage('No session yet.')
        LOGGER.error('No session yet.')
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
      console.log('This peer ID:', this.peerId)
    })
    this.peer.on('error', err => {
      console.log(err)
    })

    // wait until peer is open
    await waitUntil(() => {
      return this.peer.open;
    })

    this.conn = this.peer.connect(session.peerId)

    this.conn.once('open', () => {
      const remoteId = this.conn.remoteId;
      console.log(`Connection opened. Remote Peer ID: ${remoteId}`);
      console.log('Remote Peer ID', remoteId);
    });

    this.conn.on('data', data => {
      console.log(`Remote data: ${data}\n`);
    });

    this.conn.once('close', () => {
      console.log('Connection closed.');
    });

    this.conn.on('error', err => {
      console.log(err);
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