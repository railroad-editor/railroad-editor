import * as React from 'react';
import {DEFAULT_INITIAL_ZOOM, ZOOM_FACTOR, ZOOM_MAX, ZOOM_MIN} from "constants/tools";
import {PaperScope, Point, ToolEvent, View} from 'paper'
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";

const LOGGER = getLogger(__filename)


export interface WithMoveToolPublicProps {
  moveToolMouseWheel: (e: React.WheelEvent<HTMLElement>, { view }: { view: View }) => void
  moveToolMouseMove: (e: ToolEvent) => Point
  moveToolMouseDown: (e: ToolEvent) => void
  moveToolMouseUp: (e: ToolEvent) => void
  moveToolMouseDrag: (e: ToolEvent) => void
  resetViewPosition: () => void
  builder?: BuilderStore
  layout?: LayoutStore
}


interface WithMoveToolState {
  sx: number  // scale center x
  sy: number  // scale center y
  tx: number  // translate x
  ty: number  // translate y
  x: number
  y: number
  zoom: number
}

export type WithMoveToolProps = WithMoveToolPublicProps

/**
 * キャンバスのパニング・ズーム機能を提供するHOC。
 */
export default function withMoveTool(WrappedComponent: React.ComponentClass<WithMoveToolPublicProps>) {


  @inject(STORE_BUILDER, STORE_LAYOUT)
  @observer
  class WithMoveTool extends React.Component<WithMoveToolProps, WithMoveToolState> {

    private _pan: any
    mousePosition: Point
    isFocused: boolean
    view: any

    constructor(props: WithMoveToolProps) {
      super(props)
      this.state = {
        sx: 0, // scale center x
        sy: 0, // scale center y
        tx: 0, // translate x
        ty: 0, // translate y
        x: 0,
        y: 0,
        zoom: DEFAULT_INITIAL_ZOOM,
      }
      this._pan = null
      this.mousePosition = new Point(0,0)
      this.isFocused = true

      this.mouseWheel = this.mouseWheel.bind(this)
      this.mouseMove = this.mouseMove.bind(this)
      this.mouseDrag = this.mouseDrag.bind(this)
      this.mouseDown = this.mouseDown.bind(this)
      this.mouseUp = this.mouseUp.bind(this)
      this.resetViewPosition = this.resetViewPosition.bind(this)
    }

    componentDidMount() {
      window.addEventListener("focus", (e) => {
        this.isFocused = true
      }, true);
      window.addEventListener("blur", (e) => {
        this.isFocused = false
      }, true);
    }

    componentWillReceiveProps(props: WithMoveToolProps) {
      if (this.props.builder.paperViewLoaded === false && props.builder.paperViewLoaded === true) {
        this.resetViewPosition()
      }
    }

    /**
     * Get pan event data
     *
     * @param  {ToolEvent} e Paper.js ToolEvent
     * @return {Object}      Object representing pan event
     */
    getPanEventData = (e: ToolEvent|any) => {
      const { point, event: { touches, pageX, pageY }, tool: { view } } = e
      return {
        point: view.projectToView(point),
        x: (touches) ? touches[0].pageX : pageX,
        y: (touches) ? touches[0].pageY : pageY,
      }
    }

    /**
     * Get pan event state
     *
     * @param  {ToolEvent} e    Paper.js ToolEvent
     * @param  {Object}    prev Previous pan event data
     * @param  {Object}    next Next pan event data
     * @return {Object}         Next pan state data
     */
    getPanEventState = (e: ToolEvent|any, prev: any, next: any) => {
      const { x, y } = this.state
      const { point, tool: { view } } = e
      const t = point.subtract(view.viewToProject(prev.point))
      return {
        tx: t.x,
        ty: t.y,
        x: x + t.x,
        y: y + t.y,
      }
    }

    /**
     * Mouse wheel handler
     *
     * @param  {SyntheticEvent} e    React's SyntheticEvent
     * @param  {PaperScope}     view Paper.js PaperScope instance
     */
    mouseWheel = (e: React.WheelEvent<HTMLElement>, { view }: { view: View }) => {
      e.nativeEvent.preventDefault()

      LOGGER.debug(e.nativeEvent)

      // ホイールの移動距離からズーム倍率を計算する
      const delta = - e.nativeEvent.deltaY
      const newZoom = (1 + delta * ZOOM_FACTOR) * this.state.zoom

      // 最大拡大率・最小縮小率を超えないようにする
      if (ZOOM_MIN < newZoom && newZoom < ZOOM_MAX) {
        // ウィンドウにフォーカスが当たっていれば、mouseMoveイベントで常に取得しているマウス位置をズームの中心とする
        // フォーカスが当たっていない場合は上記イベントが発火しないので、View座標空間からProject座標空間に変換して位置を求める（ただしあまり正確ではない）
        let zoomCenter
        if (this.isFocused) {
          zoomCenter = this.mousePosition
          LOGGER.debug(`zoomCenter=${zoomCenter} (focused)`)
        } else {
          const { pageX, pageY } = e
          const { offsetLeft, offsetTop } = e.currentTarget
          zoomCenter = this.view.viewToProject(new Point(pageX - offsetLeft, pageY - offsetTop))
          LOGGER.debug(`zoomCenter=${zoomCenter} (not focused)`)
        }
        this.setState({
          sx: zoomCenter.x,
          sy: zoomCenter.y,
          zoom: newZoom,
        })
      }
    }

    mouseMove = (e: ToolEvent) => {
      // キャンバス上のマウスカーソルの位置を更新
      this.mousePosition = e.point
      this.view = (e as any).tool.view
      // LOGGER.trace(e.point)
      // this.props.setMousePosition(e.point)
      return e.point
    }

    /**
     * Mouse down handler
     *
     * @param  {ToolEvent} e Paper.js ToolEvent
     */
    mouseDown = (e: ToolEvent|any) => {
      //this._pan = this.getPanEventData(e)
      // const { tool: { view } } = e
    }

    /**
     * Mouse drag handler
     *
     * @TODO: fix start pan glitch
     * @TODO: transforming view manually is much faster,
     * figure out how to do it fast with react
     *
     * @param  {ToolEvent} e Paper.js ToolEvent
     */
    mouseDrag = (e: ToolEvent|any) => {
      const { tool: { view } } = e
      if (!this._pan) {
        this._pan = this.getPanEventData(e)
        return
      }
      const prev = this._pan
      const next = this.getPanEventData(e)
      //this.setState(this.getPanEventState(e, prev, next))
      const { tx, ty } = this.getPanEventState(e, prev, next)
      // transform view manually
      view.translate(tx, ty)
      this._pan = next
    }

    /**
     * Mouse up handler
     *
     * @param  {ToolEvent} e Paper.js ToolEvent
     */
    mouseUp = (e: ToolEvent) => {
      this._pan = null
    }

    resetViewPosition = () => {
      if (window.PAPER_SCOPE) {
        // TODO: 何故か縦方向の位置が少し低い。ひとまず固定値で補正して調査中。
        const {paperWidth, paperHeight} = this.props.layout.config
        const windowCenter = window.PAPER_SCOPE.view.viewToProject(new Point(window.innerWidth /2, window.innerHeight/2 - 30))
        const boardCenter = new Point(paperWidth / 2, paperHeight / 2)
        const diff = windowCenter.subtract(boardCenter)
        window.PAPER_SCOPE.view.translate(diff.x, diff.y)
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          {...this.state}
          moveToolMouseWheel={this.mouseWheel}
          moveToolMouseMove={this.mouseMove}
          moveToolMouseDown={this.mouseDown}
          moveToolMouseDrag={this.mouseDrag}
          moveToolMouseUp={this.mouseUp}
          resetViewPosition={this.resetViewPosition}
        />
      )
    }
  }

  return WithMoveTool

}
