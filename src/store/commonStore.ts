import {action, computed, observable} from "mobx";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {LayoutMeta} from "store/layoutStore";
import LayoutAPI from "apis/layout";
import {create, persist} from "mobx-persist";
import Auth from "aws-amplify/lib/Auth";


const INITIAL_STATE = {
  authData: null,
  layouts: []
}


export class CommonStore {
  @observable layouts: LayoutMeta[]
  @observable userInfo: AuthData
  @observable isPaperLoaded: boolean

  constructor({layouts, authData}) {
    this.layouts = layouts
    this.userInfo = authData
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
}

const hydrate = create({})

const store = new CommonStore(INITIAL_STATE)

// hydrate('userInfo', store).then(() => console.log('userInfo hydrated'))

export default store


