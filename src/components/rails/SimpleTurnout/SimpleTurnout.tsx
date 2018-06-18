import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import {ArcDirection} from "components/rails/parts/primitives/ArcPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import SimpleTurnoutRailPart from "components/rails/parts/SimpleTurnoutRailPart";


export interface SimpleTurnoutProps extends RailBaseProps {
  length: number
  radius: number
  centerAngle: number
  branchDirection: ArcDirection
}


export default class SimpleTurnout extends RailBase<SimpleTurnoutProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'SimpleTurnout',
    numJoints: 3,
    pivotJointChangingStride: 1,
    numConductionStates: 2
  }

  constructor(props: SimpleTurnoutProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, length, radius, centerAngle, branchDirection, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <SimpleTurnoutRailPart
        length={length}
        radius={radius}
        centerAngle={centerAngle}
        direction={branchDirection}
        position={position}
        angle={angle}
        pivotJointIndex={pivotJointIndex}
        selected={selected}
        opacity={opacity}
        visible={visible}
        data={{
          type: 'RailPart',
          railId: id,
          partId: 0
        }}
        onLeftClick={this.props.onRailPartLeftClick}
        ref={this.getInstance}
      />
    )
  }
}
