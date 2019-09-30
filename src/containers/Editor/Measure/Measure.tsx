import * as React from "react";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {Point} from "paper";
import {Layer, Line, PointText} from "react-paper-bindings";
import {MeasureStore} from "../../../store/measureStore";
import {STORE_MEASURE} from "store/constants";

const LOGGER = getLogger(__filename)

export interface MeasureProps {
  mousePosition: Point2D
  measure?: MeasureStore
}

export interface MeasureState {
  fixedPosition: Point2D
}


@inject(STORE_MEASURE)
@observer
export class Measure extends React.Component<MeasureProps, MeasureState> {

  constructor(props: MeasureProps) {
    super(props)
    this.state = {
      fixedPosition: null
    }
  }

  renderLine = (from: Point2D, mouse: Point2D, to: Point2D) => {
    if (! from) {
      return null
    }
    let lineTo
    if (! to) {
      // マウス移動中は、ジョイントの当たり判定と干渉しないように線を少し短くする
      lineTo = new Point(mouse).add(new Point(from.x - mouse.x, from.y - mouse.y).normalize(5))
    } else {
      lineTo = to
    }
    return (
      <Line
        from={from}
        to={lineTo}
        strokeColor={'blue'}
        strokeWidth={5}
      />
    )
  }

  renderText = (from: Point2D, to: Point2D) => {
    let diff = new Point(to).subtract(new Point(from))
    // マウスカーソルの位置から、Y軸方向にのみずらした場所にテキストを表示する
    let textPosition = new Point(to).add(new Point(0, (to.y - from.y >= 0 ? 1 : -1) * 40))
    if (this.props.measure.endPosition) {
      if (! this.state.fixedPosition) {
        this.setState({
          fixedPosition: textPosition
        })
      }
    } else {
      if (this.state.fixedPosition) {
        this.setState({
          fixedPosition: null
        })
      }
    }

    return (
      <PointText
        content={`${diff.length.toFixed()} (X=${diff.x.toFixed()}, Y=${diff.y.toFixed()})`}
        fillColor={'black'}
        fontFamily={'Courier New'}
        fontSize={20}
        fontWeight={'bold'}
        justification={'center'}
        point={this.state.fixedPosition ? [this.state.fixedPosition.x, this.state.fixedPosition.y] : [textPosition.x, textPosition.y]}
      />
    )
  }

  render() {
    let from = this.props.measure.startPosition
    let to = this.props.measure.endPosition
    let mouse = this.props.mousePosition
    return (
      <>
        {
          from != null &&
          <Layer>
            {this.renderLine(from, mouse, to)}
            {this.renderText(from, to ? to : mouse)}
          </Layer>
        }
      </>
    )
  }
}

