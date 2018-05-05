import * as React from 'react'
import CurveRailIcon from './Icon/CurveRailIcon'
import StraightRailIcon from './Icon/StraightRailIcon'
import TurnoutIcon from './Icon/TurnoutIcon'
import SpecialRailIcon from "components/Editor/ToolBar/Icon/SpecialRailIcon";
import RailGroupIcon from "components/Editor/ToolBar/Icon/RailGroupIcon";
import {AppBar, Toolbar as MuiToolbar} from "material-ui"
import {StyledIconButton, StyledLoginButton, StyledSignUpButton, VerticalDivider} from "./styles";
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
import getLogger from "logging";
import Typography from "material-ui/Typography";
import * as classNames from "classnames"
import Tooltip from "material-ui/Tooltip";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import {CommonStore} from "store/commonStore";
import {MenuDrawer} from "components/Editor/MenuDrawer/MenuDrawer";
import LoginDialog from "components/Editor/ToolBar/LoginDialog/LoginDialog";
import SignUpDialog from "components/Editor/ToolBar/SignUpDialog/SignUpDialog";
import {SettingsDialog} from "components/Editor/ToolBar/SettingsDialog/SettingsDialog";
import {compose} from "recompose";

const LOGGER = getLogger(__filename)


export interface ToolBarProps {
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore

  resetViewPosition: () => void
}

export interface ToolBarState {
  openMenu: boolean
  openLogin: boolean
  openSignUp: boolean
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedToolBarProps = ToolBarProps & WithBuilderPublicProps



@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT)
@observer
export class ToolBar extends React.Component<EnhancedToolBarProps, ToolBarState> {

  constructor(props: EnhancedToolBarProps) {
    super(props)
    this.state = {
      openMenu: false,
      openLogin: false,
      openSignUp: false,
      openSettings: false,
      el: undefined,
    }

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
      openMenu: true
    })
  }

  closeMenu = () => {
    this.setState({
      openMenu: false
    })
  }

  openLoginDialog = (e) => {
    this.setState({
      openLogin: true
    })
  }

  closeLoginDialog = () => {
    this.setState({
      openLogin: false
    })
  }

  openSignUpDialog = (e) => {
    this.setState({
      openSignUp: true
    })
  }

  closeSignUpDialog = () => {
    this.setState({
      openSignUp: false
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


  render() {
    return (
      <React.Fragment>
        <AppBar>
          <MuiToolbar>
            <Tooltip id="tooltip-straight-rail" title={Tools.STRAIGHT_RAILS}>
              <StyledIconButton
                className={classNames({
                  'active': this.isActive(Tools.STRAIGHT_RAILS)
                })}
                onClick={this.onClickBuilderItem(Tools.STRAIGHT_RAILS)}
              >
                <StraightRailIcon/>
              </StyledIconButton>
            </Tooltip>
            <Tooltip id="tooltip-curve-rail" title={Tools.CURVE_RAILS}>
              <StyledIconButton
                className={classNames({
                  'active': this.isActive(Tools.CURVE_RAILS)
                })}
                onClick={this.onClickBuilderItem(Tools.CURVE_RAILS)}
              >
                <CurveRailIcon/>
              </StyledIconButton>
            </Tooltip>
            <Tooltip id="tooltip-turnout-rail" title={Tools.TURNOUTS}>
              <StyledIconButton
                className={classNames({
                  'active': this.isActive(Tools.TURNOUTS)
                })}
                onClick={this.onClickBuilderItem(Tools.TURNOUTS)}
              >
                <TurnoutIcon/>
              </StyledIconButton>
            </Tooltip>
            <Tooltip id="tooltip-special-rail" title={Tools.SPECIAL_RAILS}>
              <StyledIconButton
                className={classNames({
                  'active': this.isActive(Tools.SPECIAL_RAILS)
                })}
                onClick={this.onClickBuilderItem(Tools.SPECIAL_RAILS)}
              >
                <SpecialRailIcon/>
              </StyledIconButton>
            </Tooltip>

            <Tooltip id="tooltip-rail-group" title={Tools.RAIL_GROUPS}>
              <StyledIconButton
                className={classNames({
                  'active': this.isActive(Tools.RAIL_GROUPS)
                })}
                onClick={this.onClickBuilderItem(Tools.RAIL_GROUPS)}
              >
                <RailGroupIcon/>
              </StyledIconButton>
            </Tooltip>

            {/*<Tooltip id="tooltip-feeders" title={Tools.FEEDERS}>*/}
              {/*<StyledIconButton*/}
                {/*className={classNames({*/}
                  {/*'active': this.isActive(Tools.FEEDERS)*/}
                {/*})}*/}
                {/*onClick={this.onClickBuilderItem(Tools.FEEDERS)}*/}
              {/*>*/}
                {/*<FeederIcon/>*/}
              {/*</StyledIconButton>*/}
            {/*</Tooltip>*/}
            {/*<Tooltip id="tooltip-gap" title={Tools.GAP}>*/}
              {/*<StyledIconButton*/}
                {/*className={classNames({*/}
                  {/*'active': this.isActive(Tools.GAP)*/}
                {/*})}*/}
                {/*onClick={this.onClickBuilderItem(Tools.GAP)}*/}
              {/*>*/}
                {/*<GapIcon/>*/}
              {/*</StyledIconButton>*/}
            {/*</Tooltip>*/}

            <VerticalDivider/>

            <Tooltip title={'Copy'}>
              <StyledIconButton
                onClick={(e) => {
                  this.props.builderRegisterRailGroup('Clipboard', false)
                }}>
                <CopyIcon/>
              </StyledIconButton>
            </Tooltip>
            <Tooltip title={'Cut'}>
              <StyledIconButton
                onClick={(e) => {
                this.props.builderRegisterRailGroup('Clipboard', true)
              }}>
                <CutIcon/>
              </StyledIconButton>
            </Tooltip>
            <Tooltip title={Tools.DELETE}>
              <StyledIconButton
                onClick={this.props.builderDeleteSelectedRails}
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

            <Tooltip title={Tools.PAN}>
              <StyledIconButton
                className={classNames({
                  'active': this.isActive(Tools.PAN)
                })}
                onClick={() => this.props.builder.setActiveTool(Tools.PAN)}
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

            {/* メニューアイコンを右端に配置するための空白 */}
            <Typography variant="title" color="inherit" style={{flex: 1}} />

            {/* ログイン・サインアップボタン */}
            {! this.props.common.isAuth &&
              <React.Fragment>
                <StyledLoginButton onClick={this.openLoginDialog}>
                  Login
                </StyledLoginButton>
                <StyledSignUpButton variant="raised" color="secondary" onClick={this.openSignUpDialog}>
                  Sign Up
                </StyledSignUpButton>
                <LoginDialog
                  open={this.state.openLogin}
                  onClose={this.closeLoginDialog}
                  setAuthData={this.props.common.setAuthData}
                  loadLayoutList={this.props.common.loadLayoutList}
                />
                <SignUpDialog
                  open={this.state.openSignUp}
                  onClose={this.closeSignUpDialog}
                  setAuthData={this.props.common.setAuthData}
                  loadLayoutList={this.props.common.loadLayoutList}
                />
              </React.Fragment>
            }

            {/* メニュー */}
            {this.props.common.isAuth &&
              <React.Fragment>
                <Tooltip id="tooltip-menu" title={"Menu"}>
                  <StyledIconButton onClick={this.openMenu} >
                    <MenuIcon/>
                  </StyledIconButton>
                </Tooltip>
                <MenuDrawer open={this.state.openMenu} onClose={this.closeMenu}/>
              </React.Fragment>
            }
          </MuiToolbar>
        </AppBar>
      </React.Fragment>
    )
  }
}


export default compose<ToolBarProps, ToolBarProps>(
  withBuilder
)(ToolBar)
