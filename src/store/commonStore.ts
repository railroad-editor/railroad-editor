import {action, computed, observable, reaction} from "mobx";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import LayoutAPI from "apis/layout";
import {create} from "mobx-persist";
import {DEFAULT_INITIAL_ZOOM} from "constants/tools";
import {EditorMode} from "store/uiStore";
import {Point} from "paper";
import builderStore from "store/builderStore";
import simulatorLogicStore from "store/simulatorLogicStore";


const INITIAL_STATE = {
  authData: null,
  layouts: []
}


export class CommonStore {
  @observable layouts: LayoutMeta[]
  @observable userInfo: AuthData
  @observable isPaperLoaded: boolean
  @observable initialZoom: number
  @observable editorMode: EditorMode
  @observable zoom: number
  @observable zooming: boolean
  @observable pan: Point
  @observable panning: boolean


  constructor({layouts, authData}) {
    this.layouts = layouts
    this.userInfo = authData
    this.isPaperLoaded = false
    this.initialZoom = DEFAULT_INITIAL_ZOOM
    this.editorMode = EditorMode.BUILDER
    this.zooming = false
    this.panning = false

    // zoomがセットされてから少し経ったらzoomingをfalseに戻す
    reaction(() => this.zoom,
      () => this.zooming = false,
      {
        delay: 200
      }
    )

    // zoomがセットされてから少し経ったらzoomingをfalseに戻す
    reaction(() => this.pan,
      () => this.panning = false,
      {
        delay: 200
      }
    )

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
    return this.userInfo.username
  }


  @action
  setAuthData = (authData: any) => {
    this.userInfo = authData
    // ログインしたらロードする
    if (authData) {
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
  setZoom =  (zoom: number) => {
    this.zoom = zoom
    this.zooming = true
  }

  @action
  setPan = (point: Point) => {
    this.pan = point
    this.panning = true
  }
}

const hydrate = create({})

const store = new CommonStore(INITIAL_STATE)

// hydrate('userInfo', store).then(() => console.log('userInfo hydrated'))

export default store


