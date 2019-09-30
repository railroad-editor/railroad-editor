import {action, computed, observable, runInAction} from "mobx";
import {UserInfo} from "containers/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import {DEFAULT_INITIAL_ZOOM} from "constants/tools";
import {PaperScope} from "paper";

export enum EditorMode {
  BUILDER = 'Builder',
  SIMULATOR = 'Simulator'
}

export interface EditorStoreState {
  layouts: LayoutMeta[]
  userInfo: UserInfo
  paper: PaperScope
  mode: EditorMode
  initialZoom: number
  zoom: number
  zooming: boolean
  pan: Point2D
  panning: boolean
}


const INITIAL_STATE: EditorStoreState = {
  layouts: [],
  userInfo: null,
  paper: null,
  initialZoom: DEFAULT_INITIAL_ZOOM,
  mode: EditorMode.BUILDER,
  zoom: null,
  zooming: false,
  pan: null,
  panning: false,
}


export class EditorStore {
  @observable layouts: LayoutMeta[]
  @observable userInfo: UserInfo
  @observable paper: PaperScope
  @observable mode: EditorMode
  @observable initialZoom: number
  @observable zoom: number
  @observable zooming: boolean
  @observable pan: Point2D
  @observable panning: boolean


  constructor({layouts, userInfo, paper, initialZoom, mode, zoom, zooming, pan, panning}: EditorStoreState) {
    this.layouts = layouts
    this.userInfo = userInfo
    this.paper = paper
    this.initialZoom = initialZoom
    this.mode = mode
    this.zoom = zoom
    this.zooming = zooming
    this.pan = pan
    this.panning = panning

  }

  // ========= computed

  @computed
  get isAuth() {
    return !! this.userInfo
  }

  @computed
  get currentUser() {
    return this.userInfo.id
  }

  @computed
  get isPaperLoaded() {
    return !! this.paper
  }

  // ========= action

  @action
  setUserInfo = (userInfo: any) => {
    this.userInfo = userInfo
  }

  @action
  setLayoutList = (layoutMeta: LayoutMeta[]) => {
    this.layouts = layoutMeta
  }

  @action
  setPaperScope = (paperScope: PaperScope) => {
    this.paper = paperScope
  }

  @action
  setInitialZoom = (zoom: number) => {
    this.initialZoom = zoom
  }

  @action
  setMode = (mode: EditorMode) => {
    this.mode = mode
  }

  @action
  setZoom = (zoom: number) => {
    this.zoom = zoom
    this.zooming = true
    setTimeout(() =>  runInAction(() => {
      this.zooming = false
    }), 200)
  }

  @action
  setPan = (point: Point2D) => {
    this.pan = point
    this.panning = true
    setTimeout(() =>  runInAction(() => {
      this.panning = false
    }), 200)
  }
}

const store = new EditorStore(INITIAL_STATE)

export default store

