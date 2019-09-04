import {action, computed, observable, reaction, runInAction} from "mobx";
import {UserInfo} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import LayoutAPI from "apis/layout";
import {DEFAULT_INITIAL_ZOOM} from "constants/tools";
import {EditorMode} from "store/uiStore";
import {Point} from "paper";
import builderStore from "store/builderStore";
import simulatorLogicStore from "store/simulatorLogicStore";


const INITIAL_STATE = {
  layouts: [],
  userInfo: null,
  isPaperLoaded: false,
  initialZoom: DEFAULT_INITIAL_ZOOM,
  editorMode: EditorMode.BUILDER,
  zoom: null,
  zooming: false,
  pan: null,
  panning: false,
  builderPalettePosition: new Point(10, 10),
  layerPalettePosition: new Point(10, 10),
  powerPackPalettePosition: new Point(10, 10),
  switcherPalettePosition: new Point(10, 10)
}


export class CommonStore {
  @observable layouts: LayoutMeta[]
  @observable userInfo: UserInfo
  @observable isPaperLoaded: boolean
  @observable initialZoom: number
  @observable editorMode: EditorMode
  @observable zoom: number
  @observable zooming: boolean
  @observable pan: Point
  @observable panning: boolean
  @observable builderPalettePosition: Point
  @observable layerPalettePosition: Point
  @observable powerPackPalettePosition: Point
  @observable switcherPalettePosition: Point


  constructor({layouts, userInfo, isPaperLoaded, initialZoom, editorMode, zoom, zooming, pan, panning,}) {
    this.layouts = layouts
    this.userInfo = userInfo
    this.isPaperLoaded = isPaperLoaded
    this.initialZoom = initialZoom
    this.editorMode = editorMode
    this.zoom = zoom
    this.zooming = zooming
    this.pan = pan
    this.panning = panning

    // モード変更時に各モードの状態を復元する
    reaction(
      () => this.editorMode,
      (mode) => {
        if (mode === EditorMode.BUILDER) {
          builderStore.changeMode(builderStore.activeTool)
          simulatorLogicStore.stopCurrentFlowSimulation()
        } else {
          simulatorLogicStore.changeMode(simulatorLogicStore.activeTool)
          simulatorLogicStore.startCurrentFlowSimulation()
        }
      }
    )
  }


  @computed
  get isAuth() {
    return !! this.userInfo
  }

  @computed
  get currentUser() {
    return this.userInfo.id
  }


  @action
  setUserInfo = (userInfo: any) => {
    this.userInfo = userInfo
    // ログインしたらロードする
    if (userInfo) {
      this.loadLayoutList()
    }
  }

  @action
  loadLayoutList = async () => {
    this.layouts = await LayoutAPI.fetchLayoutList(this.currentUser)
  }

  @action
  setPaperLoaded = (loaded: boolean) => {
    this.isPaperLoaded = loaded
  }

  @action
  setInitialZoom = (zoom: number) => {
    this.initialZoom = zoom
  }

  @action
  setEditorMode = (editorMode: EditorMode) => {
    this.editorMode = editorMode
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
  setPan = (point: Point) => {
    this.pan = point
    this.panning = true
    setTimeout(() =>  runInAction(() => {
      this.panning = false
    }), 200)
  }
}

const store = new CommonStore(INITIAL_STATE)

export default store

