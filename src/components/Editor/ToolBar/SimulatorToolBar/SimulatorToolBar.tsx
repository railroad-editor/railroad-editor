import * as React from 'react'
import {Grid, Tooltip} from '@material-ui/core'
import {Commands} from "constants/tools";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_SIMULATOR_LOGIC} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {compose} from "recompose";
import withMoveTool from "components/hoc/withMoveTool";
import {StyledIconButton} from "components/Editor/ToolBar/styles";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote'
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

  onRemoteConnect = async (e) => {
    await TrainController.connect(this.props.common.userInfo.username, this.props.layout.meta.id)
    await TrainController.configure(this.props.layout.trainControllerConfig)
  }

  render() {
    return (
      <Grid xs justify="center" alignItems="center" style={{display: 'flex'}}>
        <Tooltip title={Commands.RESET_VIEW}>
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
      </Grid>
    )
  }
}


export default compose<SimulatorToolBarProps, SimulatorToolBarProps | any>(
  withMoveTool,
  withSnackbar()
)(SimulatorToolBar)
