import * as React from 'react'
import CurveRailIcon from './Icon/CurveRailIcon'
import StraightRailIcon from './Icon/StraightRailIcon'
import TurnoutIcon from './Icon/TurnoutIcon'
import SpecialRailIcon from "components/Editor/ToolBar/Icon/SpecialRailIcon";
import RailGroupIcon from "components/Editor/ToolBar/Icon/RailGroupIcon";
import {AppBar, Grid, Toolbar as MuiToolbar} from "material-ui"
import {StyledIconButton, VerticalDivider} from "./styles";
import {Tools} from "constants/tools";
import UndoIcon from 'material-ui-icons/Undo'
import RedoIcon from 'material-ui-icons/Redo'
import DeleteIcon from 'material-ui-icons/Delete'
import PanToolIcon from 'material-ui-icons/PanTool'
import AspectRatioIcon from "material-ui-icons/AspectRatio";
import MenuIcon from "material-ui-icons/Menu";
import SettingsIcon from "material-ui-icons/Settings";
import CopyIcon from "material-ui-icons/ContentCopy";
import CutIcon from "material-ui-icons/ContentCut";
import FreePlacingModeIcon from "material-ui-icons/LocationOn";
import ConnectModeIcon from "material-ui-icons/CompareArrows";
import PlayArrowIcon from "material-ui-icons/PlayArrow";
import FeederIcon from "./Icon/Feeder";
import GapIcon from "./Icon/Gap";
import getLogger from "logging";
import * as classNames from "classnames"
import Tooltip from "material-ui/Tooltip";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {CommonStore} from "store/commonStore";
import MenuDrawer from "components/Editor/MenuDrawer/MenuDrawer";
import {SettingsDialog} from "components/Editor/ToolBar/SettingsDialog/SettingsDialog";
import {compose} from "recompose";
import {EditableTypography} from "components/common/EditableTypography/EditableTypography";
import Peer from 'skyway-js';
import {LayoutLogicStore} from "store/layoutLogicStore";

const LOGGER = getLogger(__filename)


export interface ToolBarProps {
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore

  resetViewPosition: () => void
  snackbar: any
}

export interface ToolBarState {
  openMenu: boolean
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedToolBarProps = ToolBarProps & WithBuilderPublicProps



@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
@observer
export class ToolBar extends React.Component<EnhancedToolBarProps, ToolBarState> {

  myPeerId: string
  peer: Peer
  targetPeerId: string
  conn: any

  constructor(props: EnhancedToolBarProps) {
    super(props)
    this.state = {
      openMenu: false,
      openSettings: false,
      el: undefined,
    }
  }

  componentDidMount() {
    this.peer = new Peer({
      key: '423ec210-715b-4916-971f-bd800a835414',
      debug: 3,
    });
    // Show this peer's ID.
    this.peer.on('open', id => {
      this.myPeerId = id
      console.log('open', this.myPeerId)
    });

  }

  isActive(tool: string) {
    return this.props.builder.activeTool === tool
  }

  onClickBuilderItem = (tool: Tools) => (e: MouseEvent) => {
    this.props.builder.setActiveTool(tool)
    // 最後に選択していたアイテムを選択する
    this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[tool])
  }


  openMenu = (e) => {
    LOGGER.info(this.props.layout.meta)
    this.setState({
      openMenu: true,
    })
  }

  closeMenu = () => {
    this.setState({
      openMenu: false,
    })
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

  setLayoutName = (text: string) => {
    this.props.layout.updateLayoutMeta({
      name: text
    })
  }

  onChangePlacingMode = (mode: PlacingMode) => (e) => {
    this.props.builder.setPlacingMode(mode)
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


  render() {
    return (
      <>
        <AppBar>
          <MuiToolbar>
            <Grid container justify="center" spacing={0} style={{display: 'flex'}}>
              <Grid xs alignItems="center" style={{display: 'flex'}}>
                <Tooltip title={"Menu"}>
                  <StyledIconButton onClick={this.openMenu} >
                    <MenuIcon/>
                  </StyledIconButton>
                </Tooltip>
                <MenuDrawer open={this.state.openMenu} onClose={this.closeMenu}/>

                <Tooltip title={'Layout Name'}>
                  <EditableTypography
                    variant="title"
                    color="inherit"
                    text={this.props.layout.meta.name}
                    onOK={this.setLayoutName}
                  />
                </Tooltip>
              </Grid>

              <Grid xs alignItems="center" style={{display: 'flex'}}>
                <Tooltip title={"Straight Rails (S)"}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.STRAIGHT_RAILS)
                    })}
                    onClick={this.onClickBuilderItem(Tools.STRAIGHT_RAILS)}
                  >
                    <StraightRailIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={"Curve Rails (C)"}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.CURVE_RAILS)
                    })}
                    onClick={this.onClickBuilderItem(Tools.CURVE_RAILS)}
                  >
                    <CurveRailIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={"Turnouts (T)"}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.TURNOUTS)
                    })}
                    onClick={this.onClickBuilderItem(Tools.TURNOUTS)}
                  >
                    <TurnoutIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={"Special Rails (X)"}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.SPECIAL_RAILS)
                    })}
                    onClick={this.onClickBuilderItem(Tools.SPECIAL_RAILS)}
                  >
                    <SpecialRailIcon/>
                  </StyledIconButton>
                </Tooltip>

                <Tooltip title={"Rail Groups (G)"}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.RAIL_GROUPS)
                    })}
                    onClick={this.onClickBuilderItem(Tools.RAIL_GROUPS)}
                  >
                    <RailGroupIcon/>
                  </StyledIconButton>
                </Tooltip>

                <Tooltip title={Tools.FEEDERS}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.FEEDERS)
                    })}
                    onClick={this.onClickBuilderItem(Tools.FEEDERS)}
                  >
                    <FeederIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={Tools.GAP}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.GAP)
                    })}
                    onClick={this.onClickBuilderItem(Tools.GAP)}
                  >
                    <GapIcon/>
                  </StyledIconButton>
                </Tooltip>

                <Tooltip title={"PAN (Alt)"}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.isActive(Tools.PAN)
                    })}
                    onClick={() => this.props.builder.setActiveTool(Tools.PAN)}
                  >
                    <PanToolIcon/>
                  </StyledIconButton>
                </Tooltip>

                <VerticalDivider/>

                <Tooltip title={PlacingMode.FREE}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.props.builder.placingMode === PlacingMode.FREE
                    })}
                    onClick={this.onChangePlacingMode(PlacingMode.FREE)}
                  >
                    <FreePlacingModeIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={PlacingMode.JOINT}>
                  <StyledIconButton
                    className={classNames({
                      'active': this.props.builder.placingMode === PlacingMode.JOINT
                    })}
                    onClick={this.onChangePlacingMode(PlacingMode.JOINT)}
                  >
                    <ConnectModeIcon/>
                  </StyledIconButton>
                </Tooltip>

                <VerticalDivider/>

                <Tooltip title={"Copy (Ctrl+C)"}>
                  <StyledIconButton
                    onClick={(e) => {
                      this.props.builderRegisterRailGroup('Clipboard', false)
                    }}>
                    <CopyIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={"Cut (Ctrl+X)"}>
                  <StyledIconButton
                    onClick={(e) => {
                      this.props.builderRegisterRailGroup('Clipboard', true)
                    }}>
                    <CutIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={"Delete (BS)"}>
                  <StyledIconButton
                    onClick={this.props.layoutLogic.deleteSelected}
                  >
                    <DeleteIcon/>
                  </StyledIconButton>
                </Tooltip>

                <Tooltip title={Tools.UNDO}>
                  <StyledIconButton
                    className={classNames({
                      'disabled': ! this.props.layout.canUndo
                    })}
                    onClick={this.props.layout.undo}>
                    <UndoIcon/>
                  </StyledIconButton>
                </Tooltip>
                <Tooltip title={Tools.REDO}>
                  <StyledIconButton
                    className={classNames({
                      'disabled': ! this.props.layout.canRedo
                    })}
                    onClick={this.props.layout.redo}>
                    <RedoIcon/>
                  </StyledIconButton>
                </Tooltip>

                <Tooltip title={Tools.RESET_VIEW}>
                  <StyledIconButton
                    onClick={this.props.resetViewPosition}
                  >
                    <AspectRatioIcon/>
                  </StyledIconButton>
                </Tooltip>

                <Tooltip title={'Settings'}>
                  <StyledIconButton
                    onClick={this.openSettingsDialog}
                  >
                    <SettingsIcon/>
                  </StyledIconButton>
                </Tooltip>
                <SettingsDialog
                  title={'Settings'}
                  open={this.state.openSettings}
                  onClose={this.closeSettingsDialog}
                  config={this.props.layout.config}
                  setConfig={this.props.layout.setConfig}
                  userInfo={this.props.common.userInfo}
                  layoutMeta={this.props.layout.meta}
                />

                {/*<Tooltip title={'Connect'}>*/}
                  {/*<StyledIconButton*/}
                    {/*onClick={this.connectWebRTC}*/}
                  {/*>*/}
                    {/*<PlayArrowIcon/>*/}
                  {/*</StyledIconButton>*/}
                {/*</Tooltip>*/}
                {/*<Tooltip title={'Connect'}>*/}
                  {/*<StyledIconButton*/}
                    {/*onClick={this.sendSomething}*/}
                  {/*>*/}
                    {/*<PlayArrowIcon/>*/}
                  {/*</StyledIconButton>*/}
                {/*</Tooltip>*/}

              </Grid>

              <Grid xs style={{display: 'flex'}}/>
            </Grid>
          </MuiToolbar>
        </AppBar>
      </>
    )
  }
}


export default compose<ToolBarProps, ToolBarProps>(
  withBuilder
)(ToolBar)
