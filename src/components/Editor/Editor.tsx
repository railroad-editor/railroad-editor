import * as React from 'react'
import {compose} from 'recompose'

import {Layer, Raster, Rectangle, Tool, View} from 'react-paper-bindings'

import {WithFullscreenProps} from '../hoc/withFullscreen'
import withTools, {WithToolsPrivateProps} from '../hoc/withTools'
import withMoveTool, {WithMoveToolProps} from '../hoc/withMoveTool'

import {EditorBody, StyledLayerPalette, StyledPalette, StyledToolBar, StyledWrapper} from "./Editor.style";

import './Paper.css'
import withBuilder, {WithBuilderPublicProps} from "../hoc/withBuilder";
import getLogger from "logging";
import withSelectTool, {WithSelectToolPublicProps} from "components/hoc/withSelectTool";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {Point} from "paper";
import {inject, observer} from "mobx-react";
import {CommonStore} from "store/commonStore";
import {LayoutStore} from "store/layoutStore";
import {STORE_COMMON, STORE_LAYOUT} from "constants/stores";
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
import FirstRailPutter from "components/Editor/FirstRailPutter/FirstRailPutter";
import Auth from "aws-amplify/lib/Auth";

const LOGGER = getLogger(__filename)


export interface EditorProps {
  width: number
  height: number
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


@inject(STORE_COMMON, STORE_LAYOUT)
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
  }

  async componentWillMount() {
    const session = await Auth.currentSession()
    const userInfo = await Auth.currentUserInfo()
    if (userInfo) {
      LOGGER.info(`UserInfo: ${userInfo}`)
      this.props.common.setAuthData(userInfo)
    }
  }


  isActive = (... tools: string[]) => {
    return tools.includes(this.props.builder.activeTool)
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

    // const toolbarProps = Object.assign(_.pick(this.props,
    //   ['activeTool', 'setTool', 'undo', 'redo', 'canUndo', 'canRedo', 'paletteItem', 'resetViewPosition']), {
    // })
    //
    const matrix = _.pick(this.props, [
      'sx', 'sy', 'tx', 'ty', 'x', 'y', 'zoom',
    ])

    const {paperWidth, paperHeight, gridSize} = this.props.layout.config

    // LOGGER.debug(`from=${this.props.selectionRectFrom}, to=${this.props.selectionRectTo}`)

    return (

      <StyledWrapper>
        <StyledToolBar resetViewPosition={this.props.resetViewPosition} />
        <EditorBody>
          <StyledPalette />
          <StyledLayerPalette layers={this.props.layout.currentLayoutData.layers} />
          <GridPaper
            viewWidth={DEFAULT_VIEW_WIDTH}
            viewHeight={DEFAULT_VIEW_HEIGHT}
            paperWidth={paperWidth}
            paperHeight={paperHeight}
            paperColor={DEFAULT_PAPER_COLOR}
            backgroundColor={DEFAULT_PAPER_BACKGROUND_COLOR}
            lineColor={DEFAULT_PAPER_LINE_COLOR}
            gridSize={gridSize}
            onWheel={this.props.moveToolMouseWheel}
            matrix={matrix}
            setPaperLoaded={this.props.common.setPaperLoaded}
          >
            <Layout />

            {/*/!* 後から書いたコンポーネントの方が前面に配置される *!/*/}
            {this.props.layout.isLayoutEmpty &&
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


export default compose<EditorProps|any, EditorProps|any>(
  withBuilder,
  // withFullscreen,
  withTools,
  withMoveTool,
  withSelectTool,
  // withSnackbar(),
  // connect(mapStateToProps, mapDispatchToProps)
)(Editor)

