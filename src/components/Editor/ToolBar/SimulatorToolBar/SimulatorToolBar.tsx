import * as React from 'react'
import {Grid, Tooltip} from '@material-ui/core'
import {Commands} from "constants/tools";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_COMMON, STORE_LAYOUT, STORE_SIMULATOR, STORE_SIMULATOR_LOGIC, STORE_UI} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {compose} from "recompose";
import withMoveTool from "components/hoc/withMoveTool";
import {StyledIconButton} from "components/Editor/ToolBar/styles";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote'
import {SimulatorLogicStore} from "store/simulatorLogicStore";
import {LayoutStore} from "store/layoutStore";
import TrainController from "components/Editor/ToolBar/SimulatorToolBar/TrainController";
import {UiStore} from "../../../../store/uiStore";
import ScriptDialog from "./ScriptDialog/ScriptDialog";
import MySnackbar from "../../../common/Snackbar/MySnackbar";
import {SimulatorStore} from "../../../../store/simulatorStore";

const LOGGER = getLogger(__filename)


export interface SimulatorToolBarProps {
  common?: CommonStore

  resetViewPosition: () => void
  layout?: LayoutStore
  simulator?: SimulatorStore
  simulatorLogic?: SimulatorLogicStore
  ui?: UiStore
}

export interface SimulatorToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedSimulatorToolBarProps = SimulatorToolBarProps


@inject(STORE_COMMON, STORE_LAYOUT, STORE_SIMULATOR_LOGIC, STORE_UI, STORE_SIMULATOR)
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
    await TrainController.connect(this.props.common.userInfo.id, this.props.layout.meta.id)
      .then(ret => {
        this.props.ui.setRemoteConnectedSnackbar(true)
        TrainController.configure(this.props.layout.trainControllerConfig)
      })
      .catch(err => {
        this.props.ui.setRemoteNotConnectedSnackbar(true)
        return {err}
      })
  }

  openScriptDialog = () => {
    this.props.ui.setScriptDialog(true)
  }

  closeScriptDialog = () => {
    this.props.ui.setScriptDialog(false)
  }

  closeErrorSnackbar = () => {
    this.props.simulator.setErrorSnackbar(false, '')
  }

  render() {
    return (
      <>
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
          <Tooltip title={"Script"}>
            <StyledIconButton
              onClick={this.openScriptDialog}
            >
              <SettingsRemoteIcon/>
            </StyledIconButton>
          </Tooltip>
        </Grid>
        <ScriptDialog
          open={this.props.ui.scriptDialog}
          onClose={this.closeScriptDialog}
          title={'Script'}
          powerPacks={this.props.layout.currentLayoutData.powerPacks}
          switchers={this.props.layout.currentLayoutData.switchers}
        />
        <MySnackbar open={this.props.simulator.errorSnackbar}
                    onClose={this.closeErrorSnackbar}
                    message={this.props.simulator.errorSnackbarMessage}
                    variant="error"
        />
      </>
    )
  }
}


export default compose<SimulatorToolBarProps, SimulatorToolBarProps | any>(
  withMoveTool,
)(SimulatorToolBar)
