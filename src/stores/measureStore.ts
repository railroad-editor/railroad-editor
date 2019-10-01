import {action, observable} from "mobx";


export interface MeasureStoreState {
  // 測定を開始した位置
  startPosition: Point2D
  // 測定を終了した位置
  endPosition: Point2D
}

export const INITIAL_STATE: MeasureStoreState = {
  startPosition: null,
  endPosition: null,
}


export class MeasureStore {
  @observable startPosition: Point2D
  @observable endPosition: Point2D

  constructor({startPosition, endPosition}) {
    this.startPosition = startPosition
    this.endPosition = endPosition
  }

  @action
  setStartPosition = (position: Point2D) => {
    this.startPosition = position
  }

  @action
  setEndPosition = (position: Point2D) => {
    this.endPosition = position
  }
}


export default new MeasureStore(INITIAL_STATE)

