// windowにグローバル変数をぶち込む
// TODO: 型指定入れる
declare interface Window {
  RAIL_COMPONENTS: { [key: string]: any }
  RAIL_GROUP_COMPONENTS: { [key: string]: any }
  CANVAS: HTMLCanvasElement
}


declare interface WithSnackbarProps {
  snackbar: any
}


declare module paper {
  export interface Item {
    localToOther: (item: Item, point: Point) => Point
    getGlobalMatrix: (_dontClone?: boolean) => Matrix
    getMatrixTo: (item) => Matrix
  }
}

declare var _: any
declare var $: any
