import * as React from 'react'
import {createRef} from 'react'
import {Grid, Tooltip} from '@material-ui/core'
import {Commands} from "constants/tools";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {
  STORE_EDITOR,
  STORE_LAYOUT,
  STORE_LAYOUT_LOGIC,
  STORE_SIMULATOR,
  STORE_SIMULATOR_LOGIC,
  STORE_UI
} from "constants/stores";
import {EditorStore} from "store/editorStore";
import {compose} from "recompose";
import withMoveTool from "containers/hoc/withMoveTool";
import {StyledIconButton} from "containers/Editor/ToolBar/styles";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import CreateIcon from "@material-ui/icons/Create";
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote'
import {SimulatorLogicStore} from "store/simulatorLogicStore";
import {LayoutStore} from "store/layoutStore";
import TrainController from "containers/Editor/ToolBar/SimulatorToolBar/TrainController";
import {UiStore} from "../../../../store/uiStore";
import ScriptDialog from "./ScriptDialog/ScriptDialog";
import {Snackbar} from "../../../../components/Snackbar/Snackbar";
import {SimulatorStore} from "../../../../store/simulatorStore";
import {SimulatorSandbox} from "./ScriptDialog/SimulatorSandbox";
import {LayoutLogicStore} from "../../../../store/layoutLogicStore";
import {CONNECTED_REMOTE, NO_REMOTE_SESSION} from "../../../../constants/messages";
import {I18n} from "aws-amplify";

const LOGGER = getLogger(__filename)


export interface SimulatorToolBarProps {
  editor?: EditorStore

  resetViewPosition: () => void
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
  simulator?: SimulatorStore
  simulatorLogic?: SimulatorLogicStore
  ui?: UiStore
}

export interface SimulatorToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedSimulatorToolBarProps = SimulatorToolBarProps


@inject(STORE_EDITOR, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_SIMULATOR_LOGIC, STORE_UI, STORE_SIMULATOR)
@observer
export class SimulatorToolBar extends React.Component<EnhancedSimulatorToolBarProps, SimulatorToolBarState> {

  sandboxRef: any

  constructor(props: EnhancedSimulatorToolBarProps) {
    super(props)
    this.state = {
      openSettings: false,
      el: undefined,
    }
    this.sandboxRef = createRef()
  }

  componentDidMount() {
    this.props.simulator.setSandbox(this.sandboxRef.current)
  }

  componentDidUpdate() {
    this.props.simulator.setSandbox(this.sandboxRef.current)
  }

  onRemoteConnect = async (e) => {
    await TrainController.connect(this.props.editor.userInfo.id, this.props.layout.meta.id)
      .then(ret => {
        this.props.ui.setCommonSnackbar(true, I18n.get(CONNECTED_REMOTE), 'success')
        TrainController.configure(this.props.layout.trainControllerConfig)
      })
      .catch(err => {
        this.props.ui.setCommonSnackbar(true, I18n.get(NO_REMOTE_SESSION), 'success')
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

  onSetPowerPackPower = (id, power) => {
    this.props.layout.updatePowerPack({id, power})
  }

  onSetPowerPackDirection = (id, direction) => {
    this.props.layout.updatePowerPack({id, direction})
  }

  onSetSwitcherDirection = (id, number) => {
    this.props.layoutLogic.changeSwitcherState(id, number)
  }

  onError = (message) => {
    this.props.simulator.setErrorSnackbar(true, 'Error: ' + message)
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
          <Tooltip title={"Simulator Script"}>
            <StyledIconButton
              onClick={this.openScriptDialog}
            >
              <CreateIcon/>
            </StyledIconButton>
          </Tooltip>
        </Grid>
        <ScriptDialog
          open={this.props.ui.scriptDialog}
          onClose={this.closeScriptDialog}
          title={'Simulator Script Editor'}
          powerPacks={this.props.layout.currentLayoutData.powerPacks}
          switchers={this.props.layout.currentLayoutData.switchers}
          disableEsc={true}
        />
        {this.props.simulator.sandboxEnabled &&
        <SimulatorSandbox
          ref={this.sandboxRef}
          code={this.props.layout.currentLayoutData.script}
          powerPacks={this.props.layout.currentLayoutData.powerPacks}
          switchers={this.props.layout.currentLayoutData.switchers}
          onSetPowerPackPower={this.onSetPowerPackPower}
          onSetPowerPackDirection={this.onSetPowerPackDirection}
          onSetSwitcherDirection={this.onSetSwitcherDirection}
          onError={this.onError}
        />
        }
        <Snackbar open={this.props.simulator.errorSnackbar}
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
