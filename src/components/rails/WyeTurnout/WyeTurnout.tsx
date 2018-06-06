import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import WyeTurnoutRailPart from "components/rails/parts/WyeTurnoutRailPart";


export interface WyeTurnoutProps extends RailBaseProps {
  length: number
  radius: number
  centerAngle: number
}


export default class WyeTurnout extends RailBase<WyeTurnoutProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'WyeTurnout',
    numJoints: 3,
    pivotJointChangingStride: 1,
  }

  constructor(props: WyeTurnoutProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, radius, centerAngle, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <WyeTurnoutRailPart
        radius={radius}
        centerAngle={centerAngle}
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
          partId: 0
        }}
        ref={this.getInstance}
      />
    )
  }
}
