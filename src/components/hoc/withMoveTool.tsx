import * as React from 'react';
import {DEFAULT_INITIAL_ZOOM, ZOOM_CORRECTION, ZOOM_FACTOR, ZOOM_MAX, ZOOM_MIN} from "constants/tools";
import {PaperScope, Point, ToolEvent, View} from 'paper'
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_COMMON, STORE_LAYOUT, STORE_PAPER} from "constants/stores";
import {LayoutStore} from "store/layoutStore";
import {reaction} from "mobx";
import {CommonStore} from "store/commonStore";
import {PaperStore} from "../../store/paperStore.";

const LOGGER = getLogger(__filename)


export interface WithMoveToolProps {
  moveToolMouseWheel: (e: React.WheelEvent<HTMLElement>, {view}: { view: View }) => void
  moveToolMouseMove: (e: ToolEvent) => Point
  moveToolMouseDown: (e: ToolEvent) => void
  moveToolMouseUp: (e: ToolEvent) => void
  moveToolMouseDrag: (e: ToolEvent) => void
  resetViewPosition: () => void
  layout?: LayoutStore
  common?: CommonStore
  paper?: PaperStore
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

interface PanEventData {
  point: Point
  x: number
  y: number
}

/**
 * キャンバスのパニング・ズーム機能を提供するHOC。
 */
export default function withMoveTool(WrappedComponent: React.ComponentClass<WithMoveToolProps>) {


  @inject(STORE_LAYOUT, STORE_COMMON, STORE_PAPER)
  @observer
  class WithMoveTool extends React.Component<WithMoveToolProps, WithMoveToolState> {

    pan: PanEventData
    mousePosition: Point
    isFocused: boolean

    constructor(props: WithMoveToolProps) {
      super(props)
      this.state = {sx: 0, sy: 0, tx: 0, ty: 0, x: 0, y: 0, zoom: DEFAULT_INITIAL_ZOOM}
      this.pan = null
      this.mousePosition = new Point(0, 0)
      this.isFocused = true

      reaction(
        () => this.props.common.isPaperLoaded,
        () => this.setInitialZoom()
      )
      reaction(
        () => this.props.layout.config.paperWidth,
        () => this.setInitialZoom()
      )
      reaction(
        () => this.props.layout.config.paperHeight,
        () => this.setInitialZoom()
      )
    }

    componentDidMount() {
      window.addEventListener("resize", (e) => {
        this.setInitialZoom()
      })
      window.addEventListener("focus", (e) => {
        this.isFocused = true
      }, true);
      window.addEventListener("blur", (e) => {
        this.isFocused = false
      }, true);
    }

    /**
     * Get pan event data
     *
     * @param  {ToolEvent} e Paper.js ToolEvent
     * @return {Object}      Object representing pan event
     */
    getPanEventData = (e: ToolEvent | any) => {
      const {point, event: {touches, pageX, pageY}, tool: {view}} = e
      return {
        point: view.projectToView(point),
        x: (touches) ? touches[0].pageX : pageX,
        y: (touches) ? touches[0].pageY : pageY,
      }
    }

    /**
     * Mouse wheel handler
     *
     * @param  {SyntheticEvent} e    React's SyntheticEvent
     * @param  {PaperScope}     view Paper.js PaperScope instance
     */
    mouseWheel = (e: React.WheelEvent<HTMLElement>) => {
      e.nativeEvent.preventDefault()

      LOGGER.debug(e.nativeEvent)

      // ホイールの移動距離からズーム倍率を計算する
      const delta = -e.nativeEvent.deltaY
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
          const {pageX, pageY} = e
          const {offsetLeft, offsetTop} = e.currentTarget
          zoomCenter = this.props.paper.scope.view.viewToProject(new Point(pageX - offsetLeft, pageY - offsetTop))
          LOGGER.debug(`zoomCenter=${zoomCenter} (not focused)`)
        }

        (this.props.paper.scope.view as any).scale(newZoom, zoomCenter)
        this.props.common.setZoom(newZoom)
      }
    }

    mouseMove = (e: ToolEvent) => {
      // キャンバス上のマウスカーソルの位置を更新
      this.mousePosition = e.point
      // LOGGER.trace(e.point)
      // this.props.setMousePosition(e.point)
      return e.point
    }

    onMouseDown = (e: MouseEvent | any) => {
      switch (e.event.button) {
        // case 0:
        //   this.onLeftClick(e)
        //   break
        case 2:
          this.onRightClick(e)
          break
      }
    }

    onRightClick = (e) => {
      this.pan = this.getPanEventData(e)
    }

    /**
     * Mouse drag handler for Panning.
     */
    mouseDrag = (e: ToolEvent | any) => {
      const {point, tool: {view}} = e
      if (! this.pan) {
        return
      }

      const prev = this.pan
      const next = this.getPanEventData(e)
      const t = point.subtract(view.viewToProject(prev.point))
      view.translate(t.x, t.y)
      this.pan = next
      this.props.common.setPan(t)
      // change cursor shape
      document.body.style.cursor = 'move'
    }

    /**
     * Mouse up handler
     *
     * @param  {ToolEvent} e Paper.js ToolEvent
     */
    mouseUp = (e: ToolEvent) => {
      this.pan = null
      document.body.style.cursor = 'crosshair'
    }

    resetViewPosition = () => {
      if (! this.props.paper.scope) {
        return
      }
      let view: View | any = this.props.paper.scope.view
      if (view) {
        const {paperWidth, paperHeight} = this.props.layout.config
        // 初期ズームをセットする
        view.zoom = this.props.common.initialZoom

        // TODO: 何故か縦方向の位置が少し低い。ひとまず固定値で補正して調査中。
        const windowCenter = this.props.paper.scope.view.viewToProject(new Point(window.innerWidth / 2, window.innerHeight / 2 - 30))
        const boardCenter = new Point(paperWidth / 2, paperHeight / 2)
        const diff = windowCenter.subtract(boardCenter)
        view.translate(diff.x, diff.y)
      }
    }

    setInitialZoom = () => {
      const {paperWidth, paperHeight} = this.props.layout.config
      const zoom = Math.min(window.innerWidth / paperWidth, window.innerHeight / paperHeight)
      const correctedZoom = zoom - ZOOM_CORRECTION
      this.props.common.setInitialZoom(correctedZoom)
      LOGGER.info('Corrected Zoom', correctedZoom)
      return zoom
    }


    render() {
      return (
        <WrappedComponent
          {...this.props}
          moveToolMouseWheel={this.mouseWheel}
          moveToolMouseMove={this.mouseMove}
          moveToolMouseDown={this.onMouseDown}
          moveToolMouseDrag={this.mouseDrag}
          moveToolMouseUp={this.mouseUp}
          resetViewPosition={this.resetViewPosition}
        />
      )
    }
  }

  return WithMoveTool

}
