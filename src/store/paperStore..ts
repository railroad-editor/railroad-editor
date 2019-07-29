import {action, observable} from "mobx";
import {PaperScope} from "paper";


const INITIAL_STATE = {
  paperScope: PaperScope
}


export class PaperStore {
  @observable scope: PaperScope

  constructor({paperScope}) {
    this.scope = paperScope
  }

  @action
  setPaperScope = (paperScope: PaperScope) => {
    this.scope = paperScope
  }
}

const store = new PaperStore(INITIAL_STATE)

export default store


