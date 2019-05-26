import * as React from 'react'
import CurveRailIcon from '../Icon/CurveRailIcon'
import StraightRailIcon from '../Icon/StraightRailIcon'
import TurnoutIcon from '../Icon/TurnoutIcon'
import SpecialRailIcon from "../Icon/SpecialRailIcon";
import RailGroupIcon from "../Icon/RailGroupIcon";
import {Grid} from '@material-ui/core'
import {Tools} from "constants/tools";
import UndoIcon from '@material-ui/icons/Undo'
import RedoIcon from '@material-ui/icons/Redo'
import DeleteIcon from '@material-ui/icons/Delete'
import PanToolIcon from '@material-ui/icons/PanTool'
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import SettingsIcon from "@material-ui/icons/Settings";
import CopyIcon from "@material-ui/icons/ContentCopy";
import CutIcon from "@material-ui/icons/ContentCut";
import FreePlacingModeIcon from "@material-ui/icons/LocationOn";
import ConnectModeIcon from "@material-ui/icons/CompareArrows";
import GapIcon from "../Icon/Gap";
import getLogger from "logging";
import * as classNames from "classnames"
import Tooltip from "@material-ui/core/Tooltip";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {CommonStore} from "store/commonStore";
import {compose} from "recompose";
import {LayoutLogicStore} from "store/layoutLogicStore";
import {StyledIconButton, VerticalDivider} from "components/Editor/ToolBar/styles";
import {SettingsDialog} from "components/Editor/ToolBar/BuilderToolBar/SettingsDialog/SettingsDialog";
import withMoveTool from "components/hoc/withMoveTool";
import PowerIcon from "@material-ui/icons/Power";

const LOGGER = getLogger(__filename)


export interface BuilderToolBarProps {
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore

  resetViewPosition: () => void
  snackbar: any
}

export interface BuilderToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedBuilderToolBarProps = BuilderToolBarProps & WithBuilderPublicProps



@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
@observer
export class BuilderToolBar extends React.Component<EnhancedBuilderToolBarProps, BuilderToolBarState> {

  constructor(props: EnhancedBuilderToolBarProps) {
    super(props)
    this.state = {
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

  onChangePlacingMode = (mode: PlacingMode) => (e) => {
    this.props.builder.setPlacingMode(mode)
  }


  render() {
    return (
      <Grid xs justify="center" alignItems="center" style={{display: 'flex'}}>
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

        <Tooltip title={"Feeders (F)"}>
          <StyledIconButton
            className={classNames({
              'active': this.isActive(Tools.FEEDERS)
            })}
            onClick={this.onClickBuilderItem(Tools.FEEDERS)}
          >
            {/*<FeederIcon/>*/}
            <PowerIcon/>
          </StyledIconButton>
        </Tooltip>
        <Tooltip title={"Gap Joiners (J)"}>
          <StyledIconButton
            className={classNames({
              'active': this.isActive(Tools.GAP_JOINERS)
            })}
            onClick={this.onClickBuilderItem(Tools.GAP_JOINERS)}
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
      </Grid>
    )
  }
}


export default compose<BuilderToolBarProps, BuilderToolBarProps|any>(
  withBuilder,
  withMoveTool
)(BuilderToolBar)
