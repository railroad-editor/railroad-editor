import * as React from 'react';
import {Path, Point, ToolEvent} from 'paper'
import getLogger from "logging";
import {DEFAULT_SELECTION_RECT_COLOR, DEFAULT_SELECTION_RECT_OPACITY, Tools} from "constants/tools";
import {getRailComponent} from "components/rails/utils";
import {BuilderStore} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_PAPER} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";
import {PaperStore} from "../../store/paperStore.";
import {Layer as LayerComponent, Rectangle as RectangleComponent} from "react-paper-bindings";

const LOGGER = getLogger(__filename)


export interface WithSelectToolProps {
  selectToolMouseDown: (e: ToolEvent) => void
  selectToolMouseDrag: (e: ToolEvent) => void
  selectToolMouseUp: (e: ToolEvent) => void
  selectionLayer: React.ReactNode

  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
  paper?: PaperStore
}

interface WithSelectToolState {
  from: Point2D
  to: Point2D
}

/**
 * レールの矩形選択機能を提供するHOC。
 * 依存: WithHistory, WithBuilder
 */
export default function withSelectTool(WrappedComponent: React.ComponentClass<WithSelectToolProps>) {

  @inject(STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_PAPER)
  @observer
  class WithSelectTool extends React.Component<WithSelectToolProps, WithSelectToolState> {

    static DEBOUNCE_THRESHOLD = 5

    selectionRect: Path.Rectangle
    selectionRectFrom: Point
    debounceCount: number

    constructor(props: WithSelectToolProps) {
      super(props)
      this.state = {
        from: null,
        to: null
      }

      this.selectionRect = null
      this.selectionRectFrom = null
      this.debounceCount = 0
    }

    onMouseDown = (e: MouseEvent | any) => {
      switch (e.event.button) {
        case 0:
          this.onLeftClick(e)
          break
        // case 2:
        //   this.onRightClick(e)
        //   break
      }
    }

    /**
     * レールパーツ以外の場所を左クリックしたら、選択状態をリセットする。
     * ただし、Shiftを押しながらクリックした場合はリセットしない。
     * そのままドラッグすると矩形選択を開始する。
     * @param {paper.ToolEvent | any} e
     */
    private onLeftClick = (e) => {
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
    onMouseDrag = (e: ToolEvent | any) => {
      if (! this.selectionRectFrom) {
        return
      }
      // クリックしてから一定以上ドラッグされた時に初めて矩形を表示する
      if (this.debounceCount < WithSelectTool.DEBOUNCE_THRESHOLD) {
        this.debounceCount += 1
        return
      }
      this.props.builder.setSelecting(true)
      this.setState({
        from: this.selectionRectFrom,
        to: e.point,
      })
    }

    /**
     * ドラッグを終了したら、一部または全体が矩形に含まれるレールを選択状態にする。
     * @param {paper.ToolEvent} e
     */
    onMouseUp = (e: ToolEvent) => {
      this.props.builder.setSelecting(false)
      this.setState({
        from: null,
        to: null,
      })
      this.debounceCount = 0

      if (this.selectionRect) {
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
      }
      this.selectionRect = null
      this.selectionRectFrom = null
    }

    private selectRails = () => {
      // 選択対象は半透明でない全てのレール
      const rails = this.props.layout.currentLayoutData.rails
        .map(r => getRailComponent(r.id))
        .filter(r => r.props.opacity === 1)

      const selected = []
      rails.forEach((rail) => {
        // 矩形がRailPartを構成するPathを含むか、交わっているか確認する
        const targetPaths = rail.railPart.path.children
        let result = targetPaths.map(path => {
          let isIntersected = this.selectionRect.intersects(path)
          let isContained = this.selectionRect.contains((path as any).localToGlobal())
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

    private selectFeeders = () => {
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

    private selectGapJoiners = () => {
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

    renderSelectionLayer = () => {
      return (
        <>
          {this.props.builder.selecting &&
          <LayerComponent>
            <RectangleComponent
              from={this.state.from}
              to={this.state.to}
              fillColor={DEFAULT_SELECTION_RECT_COLOR}
              opacity={DEFAULT_SELECTION_RECT_OPACITY}
              ref={r => {
                if (r) this.selectionRect = r
              }}
            />
          </LayerComponent>
          }
        </>
      )
    }


    render() {
      let selectionLayer = this.renderSelectionLayer()
      return (
        <WrappedComponent
          {...this.props}
          selectToolMouseDown={this.onMouseDown}
          selectToolMouseDrag={this.onMouseDrag}
          selectToolMouseUp={this.onMouseUp}
          selectionLayer={selectionLayer}
        />
      )
    }
  }

  return WithSelectTool

}
