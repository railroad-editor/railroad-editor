import * as React from 'react'
import {createRef} from 'react'
import {Grid, Tooltip} from '@material-ui/core'
import {Commands} from "constants/tools";
import {inject, observer} from "mobx-react";
import {compose} from "recompose";
import withMoveTool from "containers/hoc/withMoveTool";
import {StyledIconButton} from "containers/Editor/ToolBar/styles";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import CreateIcon from "@material-ui/icons/Create";
import SettingsRemoteIcon from '@material-ui/icons/SettingsRemote'
import TrainController from "containers/Editor/ToolBar/SimulatorToolBar/TrainController";
import ScriptDialog from "./ScriptDialog/ScriptDialog";
import {Snackbar} from "components/Snackbar/Snackbar";
import {SimulatorSandbox} from "./ScriptDialog/SimulatorSandbox";
import {CONNECTED_REMOTE, NO_REMOTE_SESSION} from "constants/messages";
import {I18n} from "aws-amplify";
import {WithEditorStore, WithLayoutStore, WithSandboxStore, WithUiStore} from "stores";
import {WithSwitcherUseCase} from "useCases";
import {STORE_EDITOR, STORE_LAYOUT, STORE_SANDBOX, STORE_UI} from "constants/stores";
import {USECASE_SWITCHER} from "constants/useCases";


export type SimulatorToolBarProps = {
  resetViewPosition: () => void
} & WithEditorStore & WithLayoutStore & WithSandboxStore & WithUiStore & WithSwitcherUseCase

export interface SimulatorToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
}

type EnhancedSimulatorToolBarProps = SimulatorToolBarProps


@inject(STORE_EDITOR, STORE_LAYOUT, STORE_UI, STORE_SANDBOX, USECASE_SWITCHER)
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
    this.props.sandbox.setSandbox(this.sandboxRef.current)
  }

  componentDidUpdate() {
    this.props.sandbox.setSandbox(this.sandboxRef.current)
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
    this.props.sandbox.setErrorSnackbar(false, '')
  }

  onSetPowerPackPower = (id, power) => {
    this.props.layout.updatePowerPack({id, power})
  }

  onSetPowerPackDirection = (id, direction) => {
    this.props.layout.updatePowerPack({id, direction})
  }

  onSetSwitcherDirection = (id, number) => {
    this.props.switcherUseCase.changeSwitcherState(id, number)
  }

  onError = (message) => {
    this.props.sandbox.setErrorSnackbar(true, 'Error: ' + message)
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
        {this.props.sandbox.sandboxEnabled &&
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
        <Snackbar open={this.props.sandbox.errorSnackbar}
                  onClose={this.closeErrorSnackbar}
                  message={this.props.sandbox.errorSnackbarMessage}
                  variant="error"
        />
      </>
    )
  }
}


export default compose<SimulatorToolBarProps, SimulatorToolBarProps | any>(
  withMoveTool,
)(SimulatorToolBar)
