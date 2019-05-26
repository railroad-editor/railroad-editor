import * as React from "react";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import DoubleStraightRailPart from "components/rails/parts/DoubleStraightRailPart";


export interface DoubleStraightRailProps extends RailBaseProps {
  length: number
}


export default class DoubleStraightRail extends RailBase<DoubleStraightRailProps, RailBaseState> {

  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'DoubleStraightRail',
    numJoints: 4,
    pivotJointChangingStride: 2,
    numFeederSockets: 2,
    numConductionStates: 1
  }

  constructor(props: DoubleStraightRailProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, length, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <DoubleStraightRailPart
        length={length}
        position={position}
        angle={angle}
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
