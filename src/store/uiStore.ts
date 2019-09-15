import {action, observable} from "mobx";
import commonStore from "./editorStore";
import {SnackbarVariant} from "../components/Snackbar/Snackbar";
import {REQUIRE_LOGIN} from "../constants/messages";
import {I18n} from "aws-amplify";


export interface UiStoreState {
  drawer: boolean
  layoutsDialog: boolean
  createNewDialog: boolean
  saveNewDialog: boolean
  loginDialog: boolean
  signInDialog: boolean
  settingsDialog: boolean
  summaryDialog: boolean
  bugReportDialog: boolean
  scriptDialog: boolean
  confirmedSnackbar: boolean
  commonSnackbar: boolean
  commonSnackbarMessage: string
}

const INITIAL_STATE: UiStoreState = {
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
  confirmedSnackbar: false,
  commonSnackbar: false,
  commonSnackbarMessage: null,
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
  @observable confirmedSnackbar: boolean
  @observable commonSnackbar: boolean
  @observable commonSnackbarMessage: string
  @observable commonSnackbarVariant: SnackbarVariant

  constructor({
                drawer, layoutsDialog, createNewDialog, saveNewDialog, loginDialog, signInDialog, settingsDialog,
                bugReportDialog, summaryDialog, scriptDialog,
                confirmedSnackbar, commonSnackbar, commonSnackbarMessage
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
    this.confirmedSnackbar = confirmedSnackbar
    this.commonSnackbar = commonSnackbar
    this.commonSnackbarMessage = commonSnackbarMessage
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
      this.setCommonSnackbar(true, I18n.get(REQUIRE_LOGIN), 'error')
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
      this.setCommonSnackbar(open, I18n.get(REQUIRE_LOGIN), 'error')
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
  setCommonSnackbar = (open: boolean, message?: string, variant?: SnackbarVariant) => {
    this.commonSnackbar = open
    if (message) {
      this.commonSnackbarMessage = message
    }
    if (variant) {
      this.commonSnackbarVariant = variant
    }
  }
}

const store = new UiStore(INITIAL_STATE)

export default store


