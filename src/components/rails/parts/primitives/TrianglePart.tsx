import * as React from "react";
import {Point} from "paper";
import {default as PartBase, PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";

export interface TrianglePartProps extends PartBaseProps {
  width: number
  height: number
}

export default class TrianglePart extends PartBase<TrianglePartProps, {}> {

  constructor(props: TrianglePartProps) {
    super(props)
  }

  createPathData = (props: TrianglePartProps) => {
    const {width, height} = props
    return createTrianglePath(width, height)
  }

  protected getInternalPivotPosition(pivot: Pivot) {
    const {width, height} = this.props
    switch (pivot) {
      case Pivot.TOP:
        return new Point(0, 0)
      case Pivot.BOTTOM:
        return new Point(0, height)
      case Pivot.CENTER:
      default:
        return new Point(0, height / 3 * 2)
    }
  }
}


export function createTrianglePath(width: number, height: number) {
  let pathData = `M 0 0 L ${width / 2} ${height} L ${-width / 2} ${height} Z`
  return pathData
}
