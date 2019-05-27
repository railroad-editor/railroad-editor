import * as React from "react";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import {Tools} from "constants/tools";
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";
import {Point} from "paper";
import {Layer, Line, PointText} from "react-paper-bindings";

const LOGGER = getLogger(__filename)

export interface MeasureProps {
  mousePosition: Point
  common?: CommonStore
  builder?: BuilderStore
}

export interface MeasureState {
  fixedPosition: Point
}


@inject(STORE_COMMON, STORE_BUILDER)
@observer
export class Measure extends React.Component<MeasureProps, MeasureState> {

  constructor(props: MeasureProps) {
    super(props)
    this.state = {
      fixedPosition: null
    }

    this.onCloseDialog = this.onCloseDialog.bind(this)
  }

  onCloseDialog = () => {
    this.props.builder.setFreePlacingDialog(false)
  }

  renderLine = (from: Point, mouse: Point, to: Point) => {
    if (! from) {
      return null
    }
    let lineTo
    if (! to) {
      // マウス移動中は、ジョイントの当たり判定と干渉しないように線を少し短くする
      lineTo = mouse.add(new Point(from.x - mouse.x, from.y - mouse.y).normalize(5))
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

  renderText = (from: Point, to: Point) => {
    let diff = to.subtract(from)
    // マウスカーソルの位置から、Y軸方向にのみずらした場所にテキストを表示する
    let textPosition = to.add(new Point(0, (to.y - from.y >= 0 ? 1 : -1) * 40))
    if (this.props.builder.measureEndPosition) {
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
        fontSize={18}
        fontWeight={'bold'}
        justification={'center'}
        point={this.state.fixedPosition ? [this.state.fixedPosition.x, this.state.fixedPosition.y] : [textPosition.x, textPosition.y]}
      />
    )
  }

  render() {
    let from = this.props.builder.measureStartPosition
    let to = this.props.builder.measureEndPosition
    let mouse = this.props.mousePosition
    return (
      <>
        {
          this.props.common.editorMode === EditorMode.BUILDER &&
          this.props.builder.activeTool === Tools.MEASURE &&
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

export default compose<MeasureProps, MeasureProps | any>(
)(Measure)
