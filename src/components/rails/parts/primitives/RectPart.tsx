import * as React from "react";
import {Point} from "paper";
import PartBase, {PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";

export interface RectPartProps extends PartBaseProps {
  width: number
  height: number
}

export default class RectPart extends PartBase<RectPartProps, {}> {

  constructor(props: RectPartProps) {
    super(props)
  }

  createPathData = (props) => {
    const { width, height } = props
    return createRectPath(width, height)
  }

  protected getInternalPivotPosition(pivot: Pivot) {
    const {width, height} = this.props
    switch (pivot) {
      case Pivot.LEFT:
        return new Point(0, 0)
      case Pivot.TOP:
        return new Point(width / 2, -height / 2)
      case Pivot.RIGHT:
        return new Point(width, 0)
      case Pivot.BOTTOM:
        return new Point(width / 2, height / 2)
      case Pivot.CENTER:
      default:
        return new Point(width / 2, 0)
    }
  }
}


export function createRectPath(width: number, height: number) {
  let pathData = `M 0 0 L 0 ${-height / 2} ${width} ${-height / 2} L ${width}} 0 L ${width} ${height / 2} L 0 ${height / 2} Z`
  return pathData
}
