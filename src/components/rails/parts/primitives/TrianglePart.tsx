import * as React from "react";
import {Point} from "paper";
import {Path as PathComponent} from "react-paper-bindings";
import {default as PartBase, PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";

export interface TrianglePartProps extends PartBaseProps {
  width: number
  height: number
}

export default class TrianglePart extends PartBase<TrianglePartProps, {}> {

  constructor(props: TrianglePartProps) {
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
      pathData={createTrianglePath(width, height)}
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
