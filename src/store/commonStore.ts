import {action, computed, observable} from "mobx";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import LayoutAPI from "apis/layout";
import {create} from "mobx-persist";
import {DEFAULT_INITIAL_ZOOM} from "constants/tools";
import {EditorMode} from "store/uiStore";


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


  constructor({layouts, authData}) {
    this.layouts = layouts
    this.userInfo = authData
    this.isPaperLoaded = false
    this.initialZoom = DEFAULT_INITIAL_ZOOM
    this.editorMode = EditorMode.BUILDER
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
  }
}

const hydrate = create({})

const store = new CommonStore(INITIAL_STATE)

// hydrate('userInfo', store).then(() => console.log('userInfo hydrated'))

export default store


