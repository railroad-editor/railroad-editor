import * as React from 'react'
import {Layer, Line, Raster, Rectangle, View} from 'react-paper-bindings'
import {Point} from 'paper';
import * as _ from "lodash";
import {inject, observer} from "mobx-react";
import {EditorStore} from "../../../store/editorStore";
import {STORE_EDITOR} from "../../../store";

export interface GridPaperProps {
  viewWidth: number
  viewHeight: number
  paperWidth: number
  paperHeight: number
  gridSize: number
  lineColor: string
  paperColor: string
  backgroundColor: string
  backgroundImageUrl: string
  onWheel: any
  onFrame: any
  editor?: EditorStore
}


@inject(STORE_EDITOR)
@observer
export class GridPaper extends React.Component<GridPaperProps, {}> {

  view: View

  constructor(props: GridPaperProps) {
    super(props)
  }


  componentDidMount() {
    this.props.editor.setPaperScope(this.view.scope)
  }

  createVerticalLines = () => {
    const {paperWidth, paperHeight, gridSize, lineColor} = this.props
    return _.range(paperWidth / gridSize + 1).map(i => {
      return (
        <Line
          key={`v-line${i}`}  //`
          from={new Point(gridSize * i, 0)}
          to={new Point(gridSize * i, paperHeight)}
          data={{type: 'GridLine'}}
          // strokeColor={i % 10 === 0 ? 'white' : 'red'}
          strokeColor={lineColor}
        />)
    })
  }

  createHorizontalLines = () => {
    const {paperWidth, paperHeight, gridSize, lineColor} = this.props
    return _.range(paperHeight / gridSize + 1).map(i => {
      return (
        <Line
          key={`h-line${i}`}  //`
          from={new Point(0, gridSize * i)}
          to={new Point(paperWidth, gridSize * i)}
          data={{type: 'GridLine'}}
          // strokeColor={i % 10 === 0 ? 'white' : 'red'}
          strokeColor={lineColor}
        />)
    })
  }

  createBackground = () => {
    const {paperWidth, paperHeight, paperColor} = this.props
    return (
      <Rectangle
        from={new Point(0, 0)}
        to={new Point(paperWidth, paperHeight)}
        fillColor={paperColor}
      />
    )
  }

  createBackgroundImage = () => {
    const {paperWidth, paperHeight} = this.props
    const position = new Point(paperWidth / 2, paperHeight / 2)
    return (
      <Raster
        source={this.props.backgroundImageUrl}
        onLoad={this.onImageLoaded}
        position={position}
        opacity={0.5}
      />
    )
  }

  onImageLoaded = (instance) => {
    // いったんスケールを元に戻す。２回目のロード時に必要
    instance.scale(1 / instance.scaling.x, 1 / instance.scaling.y)
    const {paperWidth, paperHeight} = this.props
    const scaleX = paperWidth / instance.width
    const scaleY = paperHeight / instance.height
    // Paperのサイズに合うようにスケールする
    instance.scale(scaleX, scaleY)
  }


  render() {
    const {viewWidth, viewHeight, backgroundColor, onWheel, onFrame} = this.props

    return (
      <View width={viewWidth}
            height={viewHeight}
            viewProps={{
              onFrame: onFrame
            }}
            settings={{
              applyMatrix: false
            }}
            canvasProps={{
              style: {
                backgroundColor: backgroundColor
              },
              onWheel: onWheel
            }}
            ref={(view) => {
              this.view = view
              if (view) window.CANVAS = view.canvas.current
            }}
      >
        <Layer
          name="background"
        >
          {this.createBackground()}
          {this.createBackgroundImage()}
          {this.createVerticalLines()}
          {this.createHorizontalLines()}
        </Layer>
        {this.props.children}
      </View>
    )
  }
}

