import * as React from 'react'
import {compose} from 'recompose'

import {Layer, Raster, Rectangle, Tool, View} from 'react-paper-bindings'

import withFullscreen, {WithFullscreenProps} from '../hoc/withFullscreen'
import withTools, {WithToolsPrivateProps} from '../hoc/withTools'
import withMoveTool, {WithMoveToolProps} from '../hoc/withMoveTool'

import {EditorBody, StyledLayerPalette, StyledPalette, StyledToolBar, StyledWrapper} from "./Editor.style";

import './Paper.css'
import GridPaper from "components/Editor/GridPaper";
import withBuilder, {WithBuilderPublicProps} from "../hoc/withBuilder";
import {RootState} from "store/type";
import {connect} from "react-redux";
import {LayoutData} from "reducers/layout";
import {currentLayoutData, isLayoutEmpty} from "selectors";
import getLogger from "logging";
import FirstRailPutter from "./FirstRailPutter";
import withSelectTool, {WithSelectToolPublicProps} from "components/hoc/withSelectTool";
import {Tools} from "constants/tools";
import {SettingsStoreState} from "reducers/settings";
import {withSnackbar} from 'material-ui-snackbar-provider'
import Layout from "components/Editor/Layout";
import {Point} from "paper";

const LOGGER = getLogger(__filename)


export interface EditorProps {
  layout: LayoutData
  width: number
  height: number
  isLayoutEmpty: boolean
  settings: SettingsStoreState
}


type EnhancedEditorProps = EditorProps
  & WithFullscreenProps
  & WithToolsPrivateProps
  & WithMoveToolProps
  & WithBuilderPublicProps
  & WithSelectToolPublicProps


const mapStateToProps = (state: RootState) => {
  return {
    layout: currentLayoutData(state),
    isLayoutEmpty: isLayoutEmpty(state),
    settings: state.settings
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {}
}

export interface EditorState {
  // マウス位置
  mousePosition: Point
}


class Editor extends React.Component<EnhancedEditorProps, EditorState> {

  constructor(props: EnhancedEditorProps) {
    super(props)
    this.state = {
      mousePosition: new Point(0,0)
    }
  }

  isActive = (... tools: string[]) => {
    return tools.includes(this.props.activeTool)
  }


  onMouseMove = (e) => {
    this.props.builderMouseMove(e)
    const mousePosition = this.props.moveToolMouseMove(e)
    this.setState({mousePosition})
  }

  onMouseDown = (e) => {
    this.props.builderMouseDown(e)
    this.props.selectToolMouseDown(e)
    // this.props.moveToolMouseDown(e)
  }

  onMouseDrag = (e) => {
    this.props.selectToolMouseDrag(e)
    // this.props.moveToolMouseDrag(e)
  }

  onMouseUp = (e) => {
    this.props.selectToolMouseUp(e)
    // this.props.moveToolMouseUp(e)
  }


  render() {

    const toolbarProps = Object.assign(_.pick(this.props,
      ['activeTool', 'setTool', 'undo', 'redo', 'canUndo', 'canRedo', 'paletteItem', 'resetViewPosition']), {
    })

    const matrix = _.pick(this.props, [
      'sx', 'sy', 'tx', 'ty', 'x', 'y', 'zoom',
    ])

    const {paperWidth, paperHeight, gridSize} = this.props.settings

    // LOGGER.debug(`from=${this.props.selectionRectFrom}, to=${this.props.selectionRectTo}`)

    return (

      <StyledWrapper>
        <StyledToolBar {...toolbarProps} />
        <EditorBody>
          <StyledPalette />
          <StyledLayerPalette layers={this.props.layout.layers} />
          <GridPaper
            width={paperWidth}
            height={paperHeight}
            gridSize={gridSize}
            onWheel={this.props.moveToolMouseWheel}
            matrix={matrix}
          >
            <Layout />

            {/* 後から書いたコンポーネントの方が前面に配置される */}
            {this.props.isLayoutEmpty &&
              <FirstRailPutter mousePosition={this.state.mousePosition}/>
            }


            <Tool
              active={this.isActive(
                Tools.STRAIGHT_RAILS, Tools.CURVE_RAILS, Tools.TURNOUTS, Tools.SPECIAL_RAILS, Tools.RAIL_GROUPS)}
              name={'Rails'}
              onMouseDown={this.onMouseDown}
              onMouseMove={this.onMouseMove}
              onMouseDrag={this.onMouseDrag}
              onMouseUp={this.onMouseUp}
              onKeyDown={this.props.builderKeyDown}
            />
            <Tool
              active={this.isActive(Tools.PAN)}
              name={Tools.PAN}
              onMouseDown={this.props.moveToolMouseDown}
              onMouseDrag={this.props.moveToolMouseDrag}
              onMouseUp={this.props.moveToolMouseUp}
              onMouseMove={this.props.moveToolMouseMove}
            />
          </GridPaper>
        </EditorBody>
      </StyledWrapper>
    )
  }

}


export default compose<EditorProps, EditorProps|any>(
  withBuilder,
  withFullscreen,
  withTools,
  withMoveTool,
  withSelectTool,
  withSnackbar(),
  connect(mapStateToProps, mapDispatchToProps)
)(Editor)

