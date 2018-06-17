import * as React from 'react'
import {compose} from 'recompose'

import {Layer, Raster, Rectangle, Tool, View} from 'react-paper-bindings'

import {WithFullscreenProps} from '../hoc/withFullscreen'
import withTools, {WithToolsPrivateProps} from '../hoc/withTools'
import withMoveTool, {WithMoveToolProps} from '../hoc/withMoveTool'

import {EditorBody, StyledToolBar, StyledWrapper} from "./Editor.style";

import './Paper.css'
import withBuilder, {WithBuilderPublicProps} from "../hoc/withBuilder";
import getLogger from "logging";
import withSelectTool, {WithSelectToolPublicProps} from "components/hoc/withSelectTool";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {Point} from "paper";
import {inject, observer} from "mobx-react";
import {CommonStore} from "store/commonStore";
import {LayoutStore} from "store/layoutStore";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {GridPaper} from "components/Editor/GridPaper/GridPaper";
import Layout from "components/Editor/Layout/Layout";
import {
  DEFAULT_PAPER_BACKGROUND_COLOR,
  DEFAULT_PAPER_COLOR,
  DEFAULT_PAPER_LINE_COLOR,
  DEFAULT_VIEW_HEIGHT,
  DEFAULT_VIEW_WIDTH,
  Tools
} from "constants/tools";
import FreeRailPlacer from "components/Editor/FreeRailPlacer/FreeRailPlacer";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {getAllRailComponents} from "components/rails/utils";
import BuilderPalettes from "components/Editor/BuilderPalettes/BuilderPalettes";
import SimulatorPalettes from "components/Editor/SimulatorPalettes/SimulatorPalettes";
import {Tooltip} from "@material-ui/core";
import LayoutTips from "components/Editor/LayoutTips/LayoutTips";

const LOGGER = getLogger(__filename)


export interface EditorProps {
  width: number
  height: number
  builder?: BuilderStore
  common?: CommonStore
  layout?: LayoutStore
}


type EnhancedEditorProps = EditorProps
  & WithFullscreenProps
  & WithToolsPrivateProps
  & WithMoveToolProps
  & WithBuilderPublicProps
  & WithSelectToolPublicProps


export interface EditorState {
  // マウス位置
  mousePosition: Point
}


@inject(STORE_COMMON, STORE_LAYOUT, STORE_BUILDER)
@observer
class Editor extends React.Component<EnhancedEditorProps, EditorState> {

  constructor(props: EnhancedEditorProps) {
    super(props)
    this.state = {
      mousePosition: new Point(0,0)
    }
  }

  async componentDidMount() {
    this.props.resetViewPosition()
    this.props.builder.setActiveTool(Tools.STRAIGHT_RAILS)
  }


  isActive = (... tools: string[]) => {
    return tools.includes(this.props.builder.activeTool)
  }

  buildModeMouseDown = (e) => {
    // this.props.builderMouseDown(e)
    this.props.selectToolMouseDown(e)
    // this.props.moveToolMouseDown(e)
  }

  buildModeMouseMove = (e) => {
    // this.props.builderMouseMove(e)
    const mousePosition = this.props.moveToolMouseMove(e);
    this.setState({mousePosition});
    // Material-UIの要素に変にフォーカスが残ってしまうので、Canvasにいるときは常にBlurして対処
    // TODO: もっとスマートな方法が無いか調べる
    (document.activeElement as HTMLElement).blur();
  }

  buildModeMouseDrag = (e) => {
    this.props.selectToolMouseDrag(e)
  }

  buildModeMouseUp = (e) => {
    this.props.selectToolMouseUp(e)
  }

  buildModeKeyDown = (e) => {
    this.props.builderKeyDown(e)
  }

  builderModeKeyUp = (e) => {
    this.props.builderKeyUp(e)
  }

  panModeMouseDown = (e) => {
    this.props.moveToolMouseDown(e)
  }

  panModeMouseMove = (e) => {
    this.props.moveToolMouseMove(e)
  }

  panModeMouseDrag = (e) => {
    this.props.moveToolMouseDrag(e)
  }

  panModeMouseUp = (e) => {
    this.props.moveToolMouseUp(e)
  }

  panModeKeyDown = (e) => {

  }

  onFrame = (e) => {
    getAllRailComponents().forEach(r => r.onFrame(e))
  }


  // コンテキストメニュー無効化
  noopContextMenu = (e) => {
    e.preventDefault()
    return false;
  }


  render() {

    // const toolbarProps = Object.assign(_.pick(this.props,
    //   ['activeTool', 'setTool', 'undo', 'redo', 'canUndo', 'canRedo', 'paletteItem', 'resetViewPosition']), {
    // })
    //
    const matrix = _.pick(this.props, [
      'sx', 'sy', 'tx', 'ty', 'x', 'y', 'zoom',
    ])

    const {paperWidth, paperHeight, gridSize, backgroundImageUrl} = this.props.layout.config

    // LOGGER.debug(`from=${this.props.selectionRectFrom}, to=${this.props.selectionRectTo}`)

    return (
      <StyledWrapper onContextMenu={this.noopContextMenu}>
        <StyledToolBar resetViewPosition={this.props.resetViewPosition} />
        <EditorBody>
          <BuilderPalettes />
          <SimulatorPalettes />

          <LayoutTips />

          <GridPaper
            viewWidth={DEFAULT_VIEW_WIDTH}
            viewHeight={DEFAULT_VIEW_HEIGHT}
            paperWidth={paperWidth}
            paperHeight={paperHeight}
            paperColor={DEFAULT_PAPER_COLOR}
            backgroundColor={DEFAULT_PAPER_BACKGROUND_COLOR}
            backgroundImageUrl={backgroundImageUrl}
            lineColor={DEFAULT_PAPER_LINE_COLOR}
            gridSize={gridSize}
            onWheel={this.props.moveToolMouseWheel}
            onFrame={this.onFrame}
            matrix={matrix}
            setPaperLoaded={this.props.common.setPaperLoaded}
          >
            <Layout />

            {/*/!* 後から書いたコンポーネントの方が前面に配置される *!/*/}
            {this.props.builder.placingMode === PlacingMode.FREE &&
              <FreeRailPlacer mousePosition={this.state.mousePosition}/>
            }


            <Tool
              active={this.isActive(
                Tools.STRAIGHT_RAILS, Tools.CURVE_RAILS, Tools.TURNOUTS, Tools.SPECIAL_RAILS, Tools.RAIL_GROUPS)}
              name={'Rails'}
              onMouseDown={this.buildModeMouseDown}
              onMouseMove={this.buildModeMouseMove}
              onMouseDrag={this.buildModeMouseDrag}
              onMouseUp={this.buildModeMouseUp}
              onKeyDown={this.buildModeKeyDown}
              onKeyUp={this.builderModeKeyUp}
            />
            <Tool
              active={this.isActive(Tools.PAN)}
              name={Tools.PAN}
              onMouseDown={this.panModeKeyDown}
              onMouseMove={this.panModeMouseMove}
              onMouseDrag={this.panModeMouseDrag}
              onMouseUp={this.panModeMouseUp}
              onKeyDown={this.panModeKeyDown}
            />
          </GridPaper>
        </EditorBody>
      </StyledWrapper>
    )
  }

}


export default compose<EditorProps|any, EditorProps|any>(
  withBuilder,
  // withFullscreen,
  withTools,
  withMoveTool,
  withSelectTool,
  // withSnackbar(),
  // connect(mapStateToProps, mapDispatchToProps)
)(Editor)

