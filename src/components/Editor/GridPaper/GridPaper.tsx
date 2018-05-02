import * as React from 'react'
import {Layer, Line, Path, Raster, Tool, View} from 'react-paper-bindings'
import {Point} from 'paper';
import * as _ from "lodash";
import {Rectangle} from "react-paper-bindings";

export interface GridPaperProps {
  viewWidth: number
  viewHeight: number
  paperWidth: number
  paperHeight: number
  gridSize: number
  lineColor: string
  paperColor: string
  backgroundColor: string
  onWheel: any
  setPaperLoaded: (loaded: boolean) => void
  matrix?: any
}


const DEFAULT_MATRIX = {
  sx: 0, // scale center x
  sy: 0, // scale center y
  tx: 0, // translate x
  ty: 0, // translate y
  x: 0,
  y: 0,
  zoom: 1,
}


export class GridPaper extends React.Component<GridPaperProps, {}> {

  view: View|any

  constructor(props: GridPaperProps) {
    super(props)
  }


  componentDidMount() {
    window.PAPER_SCOPE = this.view.paper
    this.props.setPaperLoaded(true)
  }

  createVerticalLines = () => {
    const {paperWidth, paperHeight, gridSize, lineColor} = this.props
    return _.range(paperWidth / gridSize + 1).map(i => {
      return (
        <Line
          key={`v-line${i}`}
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
          key={`h-line${i}`}
          from={new Point(0, gridSize * i)}
          to={new Point(paperWidth,gridSize * i)}
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



  render() {
    const {viewWidth, viewHeight, backgroundColor, onWheel} = this.props
    const matrix = this.props.matrix || DEFAULT_MATRIX

    return (
        <View width={viewWidth}
              height={viewHeight}
              matrix={matrix}
              onWheel={onWheel}
              settings={{
                applyMatrix: false
              }}
              canvasProps={{
                style: {
                  backgroundColor: backgroundColor
                }
              }}
              ref={(view) => {
                this.view = view
                if (view) window.CANVAS = view.canvas
              }}
        >
          <Layer>
            {this.createBackground()}
            {this.createVerticalLines()}
            {this.createHorizontalLines()}
          </Layer>
          {this.props.children}
        </View>
    )
  }
}

