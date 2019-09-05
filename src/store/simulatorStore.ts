import {action, observable} from "mobx";
import getLogger from "logging";
import {SimulatorSandbox} from "../components/Editor/ToolBar/SimulatorToolBar/ScriptDialog/sandbox";

const LOGGER = getLogger(__filename)


const INITIAL_STATE = {
  sandbox: null,
  sandboxEnabled: true,
  errorSnackbar: false,
  errorSnackbarMessage: ''
}


export class SimulatorStore {

  @observable sandbox: SimulatorSandbox
  @observable sandboxEnabled: boolean
  @observable errorSnackbar: boolean
  @observable errorSnackbarMessage: string

  constructor({sandbox, sandboxEnabled, errorSnackbar, errorSnackbarMessage}) {
    this.sandbox = sandbox
    this.sandboxEnabled = sandboxEnabled
    this.errorSnackbar = errorSnackbar
    this.errorSnackbarMessage = errorSnackbarMessage
  }

  @action
  setSandbox = (sandbox: any) => {
    if (this.sandbox) {
      this.sandbox.destroy()
    }
    this.sandbox = sandbox
    this.sandboxEnabled = !! sandbox;
  }

  @action
  setSandboxEnabled = (enabled: boolean) => {
    this.sandboxEnabled = enabled
  }

  @action
  setErrorSnackbar = (open: boolean, message: string) => {
    this.errorSnackbar = open
    this.errorSnackbarMessage = message
  }
}

export default new SimulatorStore(INITIAL_STATE)
