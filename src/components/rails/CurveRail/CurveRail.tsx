import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import CurveRailPart from "../parts/CurveRailPart";
import {ArcDirection} from "../parts/primitives/ArcPart";
import {RailBase, RailBaseDefaultProps, RailBaseProps, RailBaseState} from "components/rails/RailBase";


export interface CurveRailProps extends RailBaseProps {
  radius: number
  centerAngle: number
}


export default class CurveRail extends RailBase<CurveRailProps, RailBaseState> {
  public static defaultProps: RailBaseDefaultProps = {
    ...RailBase.defaultProps,
    type: 'CurveRail',
    numJoints: 2,
    pivotJointChangingStride: 1,
  }

  constructor(props: CurveRailProps) {
    super(props)
    this.state = {
      jointPositions: new Array(this.props.numJoints).fill(props.position),
      jointAngles: new Array(this.props.numJoints).fill(props.angle),
    }
  }


  render() {
    const {
      position, angle, radius, centerAngle, id, selected, pivotJointIndex, opacity, visible, fillColor
    } = this.props

    return (
      <React.Fragment>
        <CurveRailPart
          radius={radius}
          centerAngle={centerAngle}
          direction={ArcDirection.RIGHT}
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
        {this.createJointComponents()}
      </React.Fragment>
    )
  }
}
