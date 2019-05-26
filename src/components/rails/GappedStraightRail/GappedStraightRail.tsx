import * as React from "react";
import GappedStraightRailPart from "components/rails/parts/GappedStraightRailPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";


export interface GappedStraightRailProps extends RailBaseProps {
  length: number
}

export default class GappedStraightRail extends RailBase<GappedStraightRailProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'StraightRail',
    numJoints: 2,
    pivotJointChangingStride: 2,
    numConductionStates: 1
  }

  constructor(props: GappedStraightRailProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const { position, angle, length, id, selected, pivotJointIndex, opacity, visible,
      onRailPartLeftClick, onRailPartMouseEnter, onRailPartMouseLeave } = this.props


  return (
      <GappedStraightRailPart
        length={length}
        position={position}
        angle={angle}
        pivotJointIndex={pivotJointIndex}
        selected={selected}
        opacity={opacity}
        visible={visible}
        data={{
          type: 'RailPart',
          railId: id,
          partId: 0,
        }}
        onLeftClick={onRailPartLeftClick}
        onMouseEnter={onRailPartMouseEnter}
        onMouseLeave={onRailPartMouseLeave}
        ref={this.getInstance}
      />
    )
  }
}
