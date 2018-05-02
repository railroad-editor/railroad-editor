import * as React from 'react'
import {Layer, Line, Path, Raster, Tool, View} from 'react-paper-bindings'
import {Point} from 'paper';
import * as _ from "lodash";


export interface GridPaperProps {
  viewWidth: number
  viewHeight: number
  paperWidth: number
  paperHeight: number
  gridSize: number
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
    return _.range(this.props.paperWidth / this.props.gridSize + 1).map(i => {
      return (
        <Line
          key={`v-line${i}`}
          from={new Point(this.props.gridSize * i, 0)}
          to={new Point(this.props.gridSize * i, this.props.paperHeight)}
          data={{type: 'GridLine'}}
          strokeColor={i % 10 === 0 ? 'white' : 'red'}
        />)
    })
  }

  createHorizontalLines = () => {
    return _.range(this.props.paperHeight / this.props.gridSize + 1).map(i => {
      return (
        <Line
          key={`h-line${i}`}
          from={new Point(0, this.props.gridSize * i)}
          to={new Point(this.props.paperWidth,this.props.gridSize * i)}
          data={{type: 'GridLine'}}
          strokeColor={i % 10 === 0 ? 'white' : 'red'}
        />)
    })
  }


  render() {
    const {viewWidth, viewHeight, onWheel} = this.props
    const matrix = this.props.matrix || DEFAULT_MATRIX

    return (
        <View width={viewWidth}
              height={viewHeight}
              matrix={matrix}
              onWheel={onWheel}
              settings={{
                applyMatrix: false
              }}
              ref={(view) => {
                this.view = view
                if (view) window.CANVAS = view.canvas
              }}
        >
          <Layer>
            {this.createVerticalLines()}
            {this.createHorizontalLines()}
          </Layer>
          {this.props.children}
        </View>
    )
  }
}

