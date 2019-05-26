import {SKYWAY_API_KEY} from "constants/tools";
import Peer from 'skyway-js';
import SessionAPI from "apis/session"
import getLogger from "logging";
import {TrainControllerConfig} from "store/layoutStore";

const LOGGER = getLogger(__filename)

class TrainController {
  peer: Peer
  peerId: string
  conn: any

  connect = async (username: string, layoutId: string) => {
    // コントローラーがセッションを作成済みか調べる
    const session = await SessionAPI.fetchSession(
      username,
      layoutId)
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

      // コントローラーに接続する
      this.conn = this.peer.connect(session.peerId, {
        label: 'aa',
        metadata: {}
      })

      this.conn.on('open', () => onConnectionOpen(this.conn));

      this.conn.on('error', (err) => {
        console.log(err)
      })

      const onConnectionOpen = (conn) => {
        LOGGER.info('P2P Connection opened.')

        // データを受信したとき
        conn.on('data', data => {
          LOGGER.info(`DATA: ${data}`)   //`
        });
        conn.on('close', () => {
          LOGGER.info('P2P Connection closed.')
        });
        conn.on('error', err => {
          LOGGER.error(err)
        });
      }
    });
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