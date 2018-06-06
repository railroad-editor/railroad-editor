import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import StraightRailPart from "../parts/StraightRailPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";


export interface StraightRailProps extends RailBaseProps {
  length: number
}

export default class StraightRail extends RailBase<StraightRailProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'StraightRail',
    numJoints: 2,
    pivotJointChangingStride: 2,
    numFeederSockets: 1,
  }

  constructor(props: StraightRailProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const { position, angle, length, id, selected, pivotJointIndex, opacity, visible, fillColor} = this.props

    return (
      <StraightRailPart
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
