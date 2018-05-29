import * as React from "react";
import {Point} from "paper";
import {Path as PathComponent} from "react-paper-bindings";
import PartBase, {PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";

export interface RectPartProps extends PartBaseProps {
  width: number
  height: number
}

export default class RectPart extends PartBase<RectPartProps, {}> {

  constructor(props: RectPartProps) {
    super(props)
  }

  render() {
    const {
      width, height,
      position, angle, pivot, fillColor, visible, opacity, selected, name, data,
      onMouseDown, onMouseDrag, onMouseUp, onClick, onDoubleClick, onMouseMove, onMouseEnter, onMouseLeave
    } = this.props

    const pivotPosition = this.getInternalPivotPosition(pivot)

    return <PathComponent
      pathData={createRectPath(width, height)}
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
