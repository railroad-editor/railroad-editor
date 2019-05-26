import * as React from "react";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import CrossingRailPart from "components/rails/parts/CrossingRailPart";


export interface CrossingRailProps extends RailBaseProps {
  length: number
  crossAngle: number
}


export default class CrossingRail extends RailBase<CrossingRailProps, RailBaseState> {

  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'CrossingRail',
    numJoints: 4,
    pivotJointChangingStride: 2,
    numConductionStates: 1
  }

  constructor(props: CrossingRailProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, crossAngle, length, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <CrossingRailPart
        length={length}
        position={position}
        angle={angle}
        crossAngle={crossAngle}
        pivotJointIndex={pivotJointIndex}
        selected={selected}
        opacity={opacity}
        visible={visible}
        fillColors={_.fill(Array(4),  fillColor)}
        data={{
          type: 'RailPart',
          railId: id,
          partId: 0,
        }}
        ref={this.getInstance}
      />
    )
  }
}
