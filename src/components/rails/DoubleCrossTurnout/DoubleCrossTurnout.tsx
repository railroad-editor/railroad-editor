import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import DoubleCrossTurnoutPart from "components/rails/parts/DoubleCrossTurnoutRailPart";


export interface DoubleCrossTurnoutProps extends RailBaseProps {
  length: number
}


export default class DoubleCrossTurnout extends RailBase<DoubleCrossTurnoutProps, RailBaseState> {

  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'DoubleCrossTurnout',
    numJoints: 4,
    pivotJointChangingStride: 2,
    numConductionStates: 2,
  }

  constructor(props: DoubleCrossTurnoutProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, length, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <DoubleCrossTurnoutPart
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
