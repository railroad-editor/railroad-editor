import {action, observable} from "mobx";
import commonStore from "./commonStore";

export enum EditorMode {
  BUILDER = 'Builder',
  SIMULATOR = 'Simulator'
}


const INITIAL_STATE = {
  layoutsDialog: false,
  createNewDialog: false,
  saveNewDialog: false,
  loginDialog: false,
  signInDialog: false,
  settingsDialog: false,
  summaryDialog: false,
  bugReportDialog: false,
  editorMode: EditorMode.BUILDER,
}


export class UiStore {
  @observable layoutsDialog: boolean
  @observable createNewDialog: boolean
  @observable saveNewDialog: boolean
  @observable loginDialog: boolean
  @observable signInDialog: boolean
  @observable settingsDialog: boolean
  @observable summaryDialog: boolean
  @observable bugReportDialog: boolean
  @observable editorMode: EditorMode

  constructor({
                layoutsDialog, createNewDialog, saveNewDialog, loginDialog, signInDialog, settingsDialog,
                bugReportDialog, summaryDialog, editorMode
              }) {
    this.layoutsDialog = layoutsDialog
    this.createNewDialog = createNewDialog
    this.saveNewDialog = saveNewDialog
    this.loginDialog = loginDialog
    this.signInDialog = signInDialog
    this.editorMode = editorMode
    this.settingsDialog = settingsDialog
    this.summaryDialog = summaryDialog
    this.bugReportDialog = bugReportDialog
  }

  @action
  setLayoutsDialog = (open: boolean, showMessage?) => {
    if (commonStore.isAuth) {
      this.layoutsDialog = open
    } else {
      if (open) showMessage("Please login.")
      this.setLoginDialog(open)
    }
  }

  @action
  setCreateNewDialog = (open: boolean) => {
    this.createNewDialog = open
  }

  @action
  setSaveNewDialog = (open: boolean, showMessage?) => {
    if (commonStore.isAuth) {
      this.saveNewDialog = open
    } else {
      if (open) showMessage("Please login.")
      this.setLoginDialog(open)
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
}

const store = new UiStore(INITIAL_STATE)

export default store


