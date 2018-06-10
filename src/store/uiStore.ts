import {action, observable} from "mobx";
import commonStore from "./commonStore";

export enum EditorMode {
  BUILDER,
  SIMULATOR
}


const INITIAL_STATE = {
  layoutsDialog: false,
  createNewDialog: false,
  saveNewDialog: false,
  loginDialog: false,
  signInDialog: false,
  editorMode: EditorMode.BUILDER,
}


export class UiStore {
  @observable layoutsDialog: boolean
  @observable createNewDialog: boolean
  @observable saveNewDialog: boolean
  @observable loginDialog: boolean
  @observable signInDialog: boolean
  @observable editorMode: EditorMode

  constructor({layoutsDialog, createNewDialog, saveNewDialog, loginDialog, signInDialog, editorMode}) {
    this.layoutsDialog = layoutsDialog
    this.createNewDialog = createNewDialog
    this.saveNewDialog = saveNewDialog
    this.loginDialog = loginDialog
    this.signInDialog = signInDialog
    this.editorMode = editorMode
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
  setEditorMode = (editorMode: EditorMode) => {
    this.editorMode = editorMode
  }
}

const store = new UiStore(INITIAL_STATE)

export default store


