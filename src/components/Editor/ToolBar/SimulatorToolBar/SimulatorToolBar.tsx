import * as React from 'react'
import {Grid, Tooltip} from '@material-ui/core'
import {SKYWAY_API_KEY, Tools} from "constants/tools";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_SIMULATOR_LOGIC} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {compose} from "recompose";
import Peer from 'skyway-js';
import withMoveTool from "components/hoc/withMoveTool";
import {StyledIconButton} from "components/Editor/ToolBar/styles";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import PanToolIcon from '@material-ui/icons/PanTool'
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote'
import * as classNames from "classnames"
import {BuilderStore} from "store/builderStore";
import {SimulatorLogicStore} from "store/simulatorLogicStore";

const LOGGER = getLogger(__filename)


export interface SimulatorToolBarProps {
  common?: CommonStore

  resetViewPosition: () => void
  snackbar: any
  builder?: BuilderStore
  simulatorLogic?: SimulatorLogicStore
}

export interface SimulatorToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedSimulatorToolBarProps = SimulatorToolBarProps



@inject(STORE_COMMON, STORE_BUILDER, STORE_SIMULATOR_LOGIC)
@observer
export class SimulatorToolBar extends React.Component<EnhancedSimulatorToolBarProps, SimulatorToolBarState> {

  myPeerId: string
  peer: Peer
  targetPeerId: string
  conn: any

  constructor(props: EnhancedSimulatorToolBarProps) {
    super(props)
    this.state = {
      openSettings: false,
      el: undefined,
    }
  }

  openSettingsDialog = (e) => {
    this.setState({
      openSettings: true
    })
  }

  closeSettingsDialog = () => {
    this.setState({
      openSettings: false
    })
  }

  onRemoteConnect = (e) => {
    this.peer = new Peer({
      key: SKYWAY_API_KEY,
      debug: 3,
    });
    // Show this peer's ID.
    this.peer.on('open', id => {
      this.myPeerId = id
      console.log('open', this.myPeerId)
    });
  }


  connectWebRTC = () => {
    const connectedPeers = {};
    const requestedPeer = "C1yv3nGCQGzgdcFs"
    if (!connectedPeers[requestedPeer]) {
      this.conn = this.peer.connect(requestedPeer, {
        label:    'chat',
        metadata: {message: 'hi i want to chat with you!'},
      });
      this.conn.on('open', (id) => {
        console.log('open', id)
      });
      this.conn.on('error', err => alert(err));

      this.conn.on('data', data => {
        console.log('data', data)
      });

      this.conn.on('close', () => {
      });
    }
  }

  sendSomething = () => {
    this.conn.send('hello!')
  }

  isActive(tool: string) {
    return this.props.simulatorLogic.activeTool === tool
  }

  render() {
    return (
      <Grid xs justify="center" alignItems="center" style={{display: 'flex'}}>
        <Tooltip title={"PAN (Alt)"}>
          <StyledIconButton
            className={classNames({
              'active': this.isActive(Tools.PAN)
            })}
            onClick={() => this.props.simulatorLogic.setActiveTool(Tools.PAN)}
          >
            <PanToolIcon/>
          </StyledIconButton>
        </Tooltip>
        <Tooltip title={Tools.RESET_VIEW}>
          <StyledIconButton
            onClick={this.props.resetViewPosition}
          >
            <AspectRatioIcon/>
          </StyledIconButton>
        </Tooltip>
        <Tooltip title={Tools.RESET_VIEW}>
          <StyledIconButton
            onClick={this.onRemoteConnect}
          >
            <SettingsRemoteIcon/>
          </StyledIconButton>
        </Tooltip>
        {/*<SimulatorSettingsDialog*/}
          {/*title={'Settings'}*/}
          {/*open={this.state.openSettings}*/}
          {/*onClose={this.closeSettingsDialog}*/}
          {/*config={this.props.layout.config}*/}
          {/*setConfig={this.props.layout.setConfig}*/}
          {/*userInfo={this.props.common.userInfo}*/}
          {/*layoutMeta={this.props.layout.meta}*/}
        {/*/>*/}
      </Grid>
    )
  }
}


export default compose<SimulatorToolBarProps, SimulatorToolBarProps|any>(
  withMoveTool
)(SimulatorToolBar)
