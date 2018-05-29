import * as React from "react";
import {Path as PathComponent} from "react-paper-bindings";
import PartBase, {PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";
import {Point} from "paper";

interface CirclePartProps extends PartBaseProps {
  radius: number
}

export default class CirclePart extends PartBase<CirclePartProps, {}> {

  constructor(props: CirclePartProps) {
    super(props)
  }

  render() {
    const {
      radius,
      position, angle, pivot, fillColor, visible, opacity, selected, name, data,
      onMouseDown, onMouseDrag, onMouseUp, onClick, onDoubleClick, onMouseMove, onMouseEnter, onMouseLeave
    } = this.props

    const pivotPosition = this.getInternalPivotPosition(pivot)

    return <PathComponent
      pathData={createCirclePath(radius)}
      pivot={pivotPosition}     // pivot parameter MUST proceed to position
      position={position}
      rotation={angle}
      fillColor={fillColor}
      visible={visible}
      opacity={opacity}
      selected={selected}
      name={name}
      data={data}
      onMouseDown={onMouseDown}
      onMouseDrag={onMouseDrag}
      onMouseUp={onMouseUp}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={this.getInstance}
    />
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
