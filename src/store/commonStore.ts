import {action, computed, observable} from "mobx";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import LayoutAPI from "apis/layout";
import {create, persist} from "mobx-persist";


const INITIAL_STATE = {
  authData: null,
  layouts: []
}


export class CommonStore {
  @observable layouts: LayoutMeta[]
  @persist('object') @observable authData: AuthData
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

const hydrate = create({})

const store = new CommonStore(INITIAL_STATE)

hydrate('authData', store).then(() => console.log('authData hydrated'))

export default store


