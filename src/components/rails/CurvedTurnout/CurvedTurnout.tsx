import * as React from "react";
import {ArcDirection} from "components/rails/parts/primitives/ArcPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import CurvedTurnoutRailPart from "components/rails/parts/CurvedTurnoutRailPart";


export interface CurvedTurnoutProps extends RailBaseProps {
  innerRadius: number
  outerRadius: number
  innerCenterAngle: number
  outerCenterAngle: number
  branchDirection: ArcDirection
}


export default class CurvedTurnout extends RailBase<CurvedTurnoutProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'CurvedTurnout',
    numJoints: 3,
    pivotJointChangingStride: 1,
    numConductionStates: 2
  }

  constructor(props: CurvedTurnoutProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, innerRadius, outerRadius, innerCenterAngle, outerCenterAngle, branchDirection, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <CurvedTurnoutRailPart
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        innerCenterAngle={innerCenterAngle}
        outerCenterAngle={outerCenterAngle}
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
