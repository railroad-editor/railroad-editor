// windowにグローバル変数をぶち込む
// TODO: 型指定入れる
declare interface Window {
  CANVAS: HTMLCanvasElement
}


declare module paper {
  export interface Item {
    localToOther: (item: Item, point: Point) => Point
    getGlobalMatrix: (_dontClone?: boolean) => Matrix
    getMatrixTo: (item) => Matrix
  }
}

// somewhere in your project
declare module _ {
  interface LoDashStatic {
    product(any: any, any: any): any

    combinations(...any: any): any
  }
}

declare var _: any
declare var $: any
