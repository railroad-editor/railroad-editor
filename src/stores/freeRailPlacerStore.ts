import {action, observable} from "mobx";


export interface FreeRailPlacerStoreState {
  // ジョイントをクリックした際のレール位置入力ダイアログ表示
  freePlacingDialog: boolean
  // ジョイントをクリックした際に入力した位置差分
  freePlacingPosition: Point2D
  // クリックされたジョイントの位置
  clickedJointPosition: Point2D
}


export const INITIAL_STATE: FreeRailPlacerStoreState = {
  freePlacingDialog: false,
  freePlacingPosition: {x: 0, y: 0},
  clickedJointPosition: {x: 0, y: 0},
}


export class FreeRailPlacerStore {
  @observable freePlacingDialog: boolean
  @observable freePlacingDifference: Point2D
  @observable clickedJointPosition: Point2D

  constructor(
    {
      freePlacingDialog,
      freePlacingPosition,
      clickedJointPosition,
    }
  ) {
    this.freePlacingDialog = freePlacingDialog
    this.freePlacingDifference = freePlacingPosition
    this.clickedJointPosition = clickedJointPosition
  }


  @action
  setFreePlacingDialog = (open: boolean) => {
    this.freePlacingDialog = open
  }

  @action
  setFreePlacingDifference = (position: Point2D) => {
    this.freePlacingDifference = position
  }

  @action
  setClickedJointPosition = (position: Point2D) => {
    this.clickedJointPosition = position
  }
}


export default new FreeRailPlacerStore(INITIAL_STATE)

