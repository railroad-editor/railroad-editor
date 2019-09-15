import {action, observable} from "mobx";
import commonStore from "./editorStore";


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
  scriptDialog: false,
  // snackbars
  confirmedSnackbar: false,
  savedLayoutSnackbar: false,
  loadedLayoutSnackbar: false,
  requireLoginSnackbar: false,
  loggedInSnackbar: false,
  noRailForGroupSnackbar: false,
  registeredRailGroupSnackbar: false,
  bugReportSnackbar: false,
  registeredRailGroupSnackbarMessage: "",
  remoteNotConnectedSnackbar: false,
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
  @observable scriptDialog: boolean
  // snackbars
  @observable confirmedSnackbar: boolean
  @observable savedLayoutSnackbar: boolean
  @observable loadedLayoutSnackbar: boolean
  @observable requireLoginSnackbar: boolean
  @observable loggedInSnackbar: boolean
  @observable noRailForGroupSnackbar: boolean
  @observable registeredRailGroupSnackbar: boolean
  @observable registeredRailGroupSnackbarMessage: string
  @observable bugReportSnackbar: boolean
  @observable remoteNotConnectedSnackbar: boolean
  @observable remoteConnectedSnackbar: boolean

  constructor({
                drawer, layoutsDialog, createNewDialog, saveNewDialog, loginDialog, signInDialog, settingsDialog,
                bugReportDialog, summaryDialog, scriptDialog,
                confirmedSnackbar, savedLayoutSnackbar, requireLoginSnackbar, loggedInSnackbar,
                noRailForGroupSnackbar, registeredRailGroupSnackbar, bugReportSnackbar,
                registeredRailGroupSnackbarMessage, remoteNotConnectedSnackbar, remoteConnectedSnackbar,
                loadedLayoutSnackbar
              }) {
    this.drawer = drawer
    this.layoutsDialog = layoutsDialog
    this.createNewDialog = createNewDialog
    this.saveNewDialog = saveNewDialog
    this.loginDialog = loginDialog
    this.signInDialog = signInDialog
    this.settingsDialog = settingsDialog
    this.summaryDialog = summaryDialog
    this.bugReportDialog = bugReportDialog
    this.scriptDialog = scriptDialog
    // snackbars
    this.confirmedSnackbar = confirmedSnackbar
    this.savedLayoutSnackbar = savedLayoutSnackbar
    this.loadedLayoutSnackbar = loadedLayoutSnackbar
    this.requireLoginSnackbar = requireLoginSnackbar
    this.loggedInSnackbar = loggedInSnackbar
    this.noRailForGroupSnackbar = noRailForGroupSnackbar
    this.registeredRailGroupSnackbar = registeredRailGroupSnackbar
    this.bugReportSnackbar = bugReportSnackbar
    this.registeredRailGroupSnackbarMessage = registeredRailGroupSnackbarMessage
    this.remoteNotConnectedSnackbar = remoteNotConnectedSnackbar
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
      this.setRequireLoginSnackbar(open)
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
      this.setRequireLoginSnackbar(open)
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
  setScriptDialog = (open: boolean) => {
    this.scriptDialog = open
  }

  // snackbars

  @action
  setConfirmedSnackbar = (open: boolean) => {
    this.confirmedSnackbar = open
  }

  @action
  setSavedLayoutSnackbar = (open: boolean) => {
    this.savedLayoutSnackbar = open
  }

  @action
  setLoadedLayoutSnackbar = (open: boolean) => {
    this.loadedLayoutSnackbar = open
  }

  @action
  setRequireLoginSnackbar = (open: boolean) => {
    this.requireLoginSnackbar = open
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
  setRemoteNotConnectedSnackbar = (open: boolean) => {
    this.remoteNotConnectedSnackbar = open
  }

  @action
  setRemoteConnectedSnackbar = (open: boolean) => {
    this.remoteConnectedSnackbar = open
  }
}

const store = new UiStore(INITIAL_STATE)

export default store


