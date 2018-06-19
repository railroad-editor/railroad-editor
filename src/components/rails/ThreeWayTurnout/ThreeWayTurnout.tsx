import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import {ArcDirection} from "components/rails/parts/primitives/ArcPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import ThreeWayTurnoutRailPart from "components/rails/parts/ThreeWayTurnoutRailPart";


export interface ThreeWayTurnoutProps extends RailBaseProps {
  length: number
  rightStart: number
  rightRadius: number
  rightCenterAngle: number
  leftStart: number
  leftRadius: number
  leftCenterAngle: number
}


export default class ThreeWayTurnout extends RailBase<ThreeWayTurnoutProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'ThreeWayTurnout',
    numJoints: 4,
    pivotJointChangingStride: 1,
    numConductionStates: 3
  }

  constructor(props: ThreeWayTurnoutProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, length, rightStart, rightRadius, rightCenterAngle, leftStart, leftRadius, leftCenterAngle, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <ThreeWayTurnoutRailPart
        length={length}
        rightStart={rightStart}
        rightRadius={rightRadius}
        rightCenterAngle={rightCenterAngle}
        leftStart={leftStart}
        leftRadius={leftRadius}
        leftCenterAngle={leftCenterAngle}
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
