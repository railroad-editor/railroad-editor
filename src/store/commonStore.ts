import {DEFAULT_GRID_SIZE, DEFAULT_INITIAL_ZOOM, DEFAULT_PAPER_HEIGHT, DEFAULT_PAPER_WIDTH} from "constants/tools";
import {action, computed, observable} from "mobx";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import LayoutAPI from "apis/layout";


const INITIAL_STATE = {
  authData: null,
  layouts: []
}


export class CommonStore {
  @observable layouts: LayoutMeta[]
  @observable authData: AuthData
  @observable isPaperLoaded: boolean

  constructor({layouts, authData}) {
    this.layouts = layouts
    this.authData = authData
  }

  @computed
  get isAuth() {
    return !! this.authData
  }

  @computed
  get currentUser() {
    return this.authData.username
  }


  @action
  setAuthData = (authData: any) => {
    this.authData = authData
  }

  @action
  loadLayoutList = async () => {
    this.layouts = await LayoutAPI.fetchLayoutList(this.currentUser)
  }

  @action
  setPaperLoaded = (loaded: boolean) => {
    this.isPaperLoaded = loaded
  }
}


export default new CommonStore(INITIAL_STATE)
