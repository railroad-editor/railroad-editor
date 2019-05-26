import * as React from 'react'
import {Grid, Tooltip} from '@material-ui/core'
import {Tools} from "constants/tools";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_SIMULATOR_LOGIC} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {compose} from "recompose";
import withMoveTool from "components/hoc/withMoveTool";
import {StyledIconButton} from "components/Editor/ToolBar/styles";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import PanToolIcon from '@material-ui/icons/PanTool'
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote'
import * as classNames from "classnames"
import {BuilderStore} from "store/builderStore";
import {SimulatorLogicStore} from "store/simulatorLogicStore";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {LayoutStore} from "store/layoutStore";
import TrainController from "components/Editor/ToolBar/SimulatorToolBar/TrainController";

const LOGGER = getLogger(__filename)


export interface SimulatorToolBarProps {
  common?: CommonStore

  resetViewPosition: () => void
  snackbar: any
  builder?: BuilderStore
  layout?: LayoutStore
  simulatorLogic?: SimulatorLogicStore
}

export interface SimulatorToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedSimulatorToolBarProps = SimulatorToolBarProps


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_SIMULATOR_LOGIC)
@observer
export class SimulatorToolBar extends React.Component<EnhancedSimulatorToolBarProps, SimulatorToolBarState> {

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

  onRemoteConnect = async (e) => {
    await TrainController.connect(this.props.common.userInfo.username, this.props.layout.meta.id)
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
        <Tooltip title={"Remote"}>
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


export default compose<SimulatorToolBarProps, SimulatorToolBarProps | any>(
  withMoveTool,
  withSnackbar()
)(SimulatorToolBar)
