import * as React from "react";
import PartBase, {PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";
import {Point} from "paper";

interface CirclePartProps extends PartBaseProps {
  radius: number
}

export default class CirclePart extends PartBase<CirclePartProps, {}> {

  constructor(props: CirclePartProps) {
    super(props)
  }

  createPathData = (props: CirclePartProps) => {
    const {radius} = props
    return createCirclePath(radius)
  }

  protected getInternalPivotPosition(pivot: Pivot) {
    const {radius} = this.props
    switch (pivot) {
      case Pivot.LEFT:
        return new Point(0, 0)
      case Pivot.TOP:
        return new Point(radius, -radius)
      case Pivot.RIGHT:
        return new Point(radius * 2, 0)
      case Pivot.BOTTOM:
        return new Point(radius, radius)
      case Pivot.CENTER:
      default:
        return new Point(radius, 0)
    }
  }
}


function createCirclePath(radius: number) {
  const pathData = `M 0 0 A ${radius},${radius} 0 0,1 ${radius * 2} 0 A ${radius} ${radius} 0 0,1 0 0 Z`
  return pathData
}
