import * as React from 'react';
import {Layer, Path, Point, ToolEvent} from 'paper'
import getLogger from "logging";
import {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {DEFAULT_SELECTION_RECT_COLOR, DEFAULT_SELECTION_RECT_OPACITY, Tools} from "constants/tools";
import {getRailComponent} from "components/rails/utils";
import {BuilderStore} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";

const LOGGER = getLogger(__filename)


export interface WithSelectToolPublicProps {
  selectToolMouseDown: (e: ToolEvent) => void
  selectToolMouseDrag: (e: ToolEvent) => void
  selectToolMouseUp: (e: ToolEvent) => void
  selectionRectFrom: Point
  selectionRectTo: Point

  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore

}

// export interface WithSelectToolPrivateProps {
//   layout: LayoutData
//   activeLayerId: number
//   setMousePosition: (point: Point) => void
// }

interface WithSelectToolState {
  selectionRectFrom: Point
  selectionRectTo: Point
}


type WithSelectToolProps = WithSelectToolPublicProps & WithBuilderPublicProps

/**
 * レールの矩形選択機能を提供するHOC。
 * 依存: WithHistory, WithBuilder
 */
export default function withSelectTool(WrappedComponent: React.ComponentClass<WithSelectToolProps>) {

  @inject(STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
  @observer
  class WithSelectTool extends React.Component<WithSelectToolProps, WithSelectToolState> {

    public static DEBOUNCE_THRESHOLD = 5

    selectionRect: Path.Rectangle
    selectionRectFrom: Point
    selectionLayer: Layer
    debounceCount: number

    constructor(props: WithSelectToolProps) {
      super(props)

      this.state = {
        selectionRectFrom: null,
        selectionRectTo: null
      }
      this.selectionRect = null
      this.debounceCount = 0
      this.mouseDrag = this.mouseDrag.bind(this)
      this.mouseDown = this.mouseDown.bind(this)
      this.mouseUp = this.mouseUp.bind(this)
    }


    /**
     * レールパーツ以外の場所を左クリックしたら、選択状態をリセットする。
     * ただし、Shiftを押しながらクリックした場合はリセットしない。
     * そのままドラッグすると矩形選択を開始する。
     * @param {paper.ToolEvent | any} e
     */
    mouseDown = (e: ToolEvent|any) => {
      // Shiftが押されておらず、RailPart上で無ければ選択状態をリセットする
      const isNotOnRailPart = (! e.item) || ! (['RailPart', 'Feeder', 'GapJoiner'].includes(e.item.data.type))
      if ((! e.modifiers.shift) && isNotOnRailPart) {
        this.props.layoutLogic.selectAll(false)
      }
      // 矩形の始点を保存する
      this.selectionRectFrom = e.point
    }


    /**
     * ドラッグ中は、矩形選択の開始地点からマウスカーソルに至る矩形を表示し続ける。
     * @param {paper.ToolEvent | any} e
     */
    mouseDrag = (e: ToolEvent|any) => {
      // クリックしてから一定以上ドラッグされた時に初めて矩形を表示する
      if (this.debounceCount < WithSelectTool.DEBOUNCE_THRESHOLD) {
        this.debounceCount += 1
        return
      }
      this.props.builder.setSelecting(true)

      // Pathを毎回生成・削除する場合、PaperRendererで描画するよりも
      // 生のPaperJSオブジェクトを操作したほうが都合が良い。
      if (this.selectionRect) {
        this.selectionRect.remove()
      }
      if (! this.selectionLayer) {
        this.selectionLayer = new Layer()
      }
      this.selectionRect = new Path.Rectangle({
          from: this.selectionRectFrom,
          to: e.point,
          fillColor: DEFAULT_SELECTION_RECT_COLOR,
          opacity: DEFAULT_SELECTION_RECT_OPACITY,
        }
      )
    }


    /**
     * ドラッグを終了したら、一部または全体が矩形に含まれるレールを選択状態にする。
     * @param {paper.ToolEvent} e
     */
    mouseUp = (e: ToolEvent) => {
      this.props.builder.setSelecting(false)
      if (! this.selectionRect) {
        return
      }

      switch (this.props.builder.activeTool) {
        case Tools.FEEDERS:
          this.selectFeeders()
          break
        case Tools.GAP_JOINERS:
          this.selectGapJoiners()
          break
        default:
          this.selectRails()
          break
      }

      // 矩形を削除する
      this.selectionRect.remove()
      this.selectionRect = null
      this.selectionLayer.remove()
      this.selectionLayer = null
      this.debounceCount = 0
    }

    selectRails = () => {
      // 選択対象は現在のレイヤーのレールとする
      const rails = this.props.layout.currentLayoutData.rails.map(r => getRailComponent(r.id))

      const selected = []
      rails.forEach((rail) => {
        // 矩形がRailPartを構成するPathを含むか、交わっているか確認する
        const targetPaths = rail.railPart.path.children
        let result = targetPaths.map(path => {
          let isIntersected = this.selectionRect.intersects(path)
          let isContained = this.selectionRect.contains((path as any).localToOther(this.selectionRect, path.position))
          return isIntersected || isContained
        }).some((e) => e)

        // 上記の条件を満たしていれば選択状態にする
        if (result) {
          selected.push(rail.props.id)
          LOGGER.info('selected', rail.props.id)
        }
      })

      this.props.layoutLogic.selectRails(selected, true)
    }

    selectFeeders = () => {
      // 選択対象は現在のレイヤーのレールとする
      const rails = this.props.layout.currentLayoutData.rails.map(r => getRailComponent(r.id))
      const feeders = _.flatMap(rails, rail => rail.feeders).filter(feeder => feeder)

      const selected = []
      feeders.forEach((feeder) => {
        // 矩形がRailPartを構成するPathを含むか、交わっているか確認する
        const targetPaths = [feeder.path]
        let result = targetPaths.map(path => {
          let isIntersected = this.selectionRect.intersects(path)
          let isContained = this.selectionRect.contains(path.position)
          return isIntersected || isContained
        }).every((e) => e)

        // 上記の条件を満たしていれば選択状態にする
        if (result) {
          selected.push(feeder.props.id)
          LOGGER.info('selected', feeder.props.id)
        }
      })

      this.props.layoutLogic.selectFeeders(selected, true)
    }

    selectGapJoiners = () => {
      // 選択対象は現在のレイヤーのレールとする
      const rails = this.props.layout.currentLayoutData.rails.map(r => getRailComponent(r.id))
      const gapJoiners = _.flatMap(rails, rail => rail.gapJoiners).filter(g => g)

      const selected = []
      gapJoiners.forEach((gapJoiner) => {
        // 矩形がRailPartを構成するPathを含むか、交わっているか確認する
        const targetPaths = [gapJoiner.path]
        let result = targetPaths.map(path => {
          let isIntersected = this.selectionRect.intersects(path)
          let isContained = this.selectionRect.contains(path.position)
          return isIntersected || isContained
        }).every((e) => e)

        // 上記の条件を満たしていれば選択状態にする
        if (result) {
          selected.push(gapJoiner.props.id)
          LOGGER.info('selected', gapJoiner.props.id)
        }
      })

      this.props.layoutLogic.selectGapJoiners(selected, true)
    }


    render() {
      return (
        <WrappedComponent
          {...this.props}
          selectToolMouseDown={this.mouseDown}
          selectToolMouseDrag={this.mouseDrag}
          selectToolMouseUp={this.mouseUp}
          selectionRectFrom={this.state.selectionRectFrom}
          selectionRectTo={this.state.selectionRectTo}
        />
      )
    }
  }

  return WithSelectTool

}
