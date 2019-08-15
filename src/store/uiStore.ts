import {action, observable} from "mobx";
import commonStore from "./commonStore";

export enum EditorMode {
  BUILDER = 'Builder',
  SIMULATOR = 'Simulator'
}


const INITIAL_STATE = {
  drawer: false,
  layoutsDialog: false,
  createNewDialog: false,
  saveNewDialog: false,
  loginDialog: false,
  signInDialog: false,
  settingsDialog: false,
  summaryDialog: false,
  bugReportDialog: false,
  editorMode: EditorMode.BUILDER,
  saveSnackbar: false,
  loginSnackbar: false,
  loggedInSnackbar: false,
  noRailForGroupSnackbar: false,
  registeredRailGroupSnackbar: false,
  bugReportSnackbar: false,
  registeredRailGroupSnackbarMessage: "",
  noSessionSnackbar: false,
  remoteConnectedSnackbar: false,
}


export class UiStore {
  @observable drawer: boolean
  @observable layoutsDialog: boolean
  @observable createNewDialog: boolean
  @observable saveNewDialog: boolean
  @observable loginDialog: boolean
  @observable signInDialog: boolean
  @observable settingsDialog: boolean
  @observable summaryDialog: boolean
  @observable bugReportDialog: boolean
  @observable editorMode: EditorMode
  @observable saveSnackbar: boolean
  @observable loginSnackbar: boolean
  @observable loggedInSnackbar: boolean
  @observable noRailForGroupSnackbar: boolean
  @observable registeredRailGroupSnackbar: boolean
  @observable registeredRailGroupSnackbarMessage: string
  @observable bugReportSnackbar: boolean
  @observable noSessionSnackbar: boolean
  @observable remoteConnectedSnackbar: boolean

  constructor({
                drawer, layoutsDialog, createNewDialog, saveNewDialog, loginDialog, signInDialog, settingsDialog,
                bugReportDialog, summaryDialog, editorMode, saveSnackbar, loginSnackbar, loggedInSnackbar,
                noRailForGroupSnackbar, registeredRailGroupSnackbar, bugReportSnackbar, registeredRailGroupSnackbarMessage,
                noSessionSnackbar, remoteConnectedSnackbar
              }) {
    this.drawer = drawer
    this.layoutsDialog = layoutsDialog
    this.createNewDialog = createNewDialog
    this.saveNewDialog = saveNewDialog
    this.loginDialog = loginDialog
    this.signInDialog = signInDialog
    this.editorMode = editorMode
    this.settingsDialog = settingsDialog
    this.summaryDialog = summaryDialog
    this.bugReportDialog = bugReportDialog
    this.saveSnackbar = saveSnackbar
    this.loginSnackbar = loginSnackbar
    this.loggedInSnackbar = loggedInSnackbar
    this.noRailForGroupSnackbar = noRailForGroupSnackbar
    this.registeredRailGroupSnackbar = registeredRailGroupSnackbar
    this.bugReportSnackbar = bugReportSnackbar
    this.registeredRailGroupSnackbarMessage = registeredRailGroupSnackbarMessage
    this.noSessionSnackbar = noSessionSnackbar
    this.remoteConnectedSnackbar = remoteConnectedSnackbar
  }

  @action
  setDrawer = (open: boolean) => {
    this.drawer = open
  }

  @action
  setLayoutsDialog = (open: boolean) => {
    if (commonStore.isAuth) {
      this.layoutsDialog = open
    } else {
      this.setLoginDialog(open)
      this.setLoginSnackbar(open)
    }
  }

  @action
  setCreateNewDialog = (open: boolean) => {
    this.createNewDialog = open
  }

  @action
  setSaveNewDialog = (open: boolean) => {
    if (commonStore.isAuth) {
      this.saveNewDialog = open
    } else {
      this.setLoginDialog(open)
      this.setLoginSnackbar(open)
    }
  }

  @action
  setLoginDialog = (open: boolean) => {
    this.loginDialog = open
  }

  @action
  setSignInDialog = (open: boolean) => {
    this.signInDialog = open
  }

  @action
  setSettingsDialog = (open: boolean) => {
    this.settingsDialog = open
  }

  @action
  setSummaryDialog = (open: boolean) => {
    this.summaryDialog = open
  }

  @action
  setBugReportDialog = (open: boolean) => {
    this.bugReportDialog = open
  }

  @action
  setSaveSnackbar = (open: boolean) => {
    this.saveSnackbar = open
  }

  @action
  setLoginSnackbar = (open: boolean) => {
    this.loginSnackbar = open
  }

  @action
  setLoggedInSnackbar = (open: boolean) => {
    this.loggedInSnackbar = open
  }

  @action
  setNoRailForGroupSnackbar = (open: boolean) => {
    this.noRailForGroupSnackbar = open
  }

  @action
  setRegisteredRailGroupSnackbar = (open: boolean, message: string) => {
    this.registeredRailGroupSnackbar = open
    this.registeredRailGroupSnackbarMessage = message
  }

  @action
  setBugReportSnackbar = (open: boolean) => {
    this.bugReportSnackbar = open
  }

  @action
  setNoSessionSnackbar = (open: boolean) => {
    this.noSessionSnackbar = open
  }

  @action
  setRemoteConnectedSnackbar = (open: boolean) => {
    this.remoteConnectedSnackbar = open
  }
}

const store = new UiStore(INITIAL_STATE)

export default store


