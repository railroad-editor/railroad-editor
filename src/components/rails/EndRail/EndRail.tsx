import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import EndRailPart from "../parts/StraightRailPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";


export interface EndRailProps extends RailBaseProps {
  length: number
}


export default class EndRail extends RailBase<EndRailProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'EndRail',
    numJoints: 1,
    pivotJointChangingStride: 1,
  }

  constructor(props: EndRailProps) {
    super(props)
    this.state = this.getInitialState(props)
  }


  renderRailPart = () => {
    const {
      position, angle, length, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <EndRailPart
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
        onLeftClick={this.props.onRailPartLeftClick}
        ref={this.getInstance}
      />
    )
  }
}
