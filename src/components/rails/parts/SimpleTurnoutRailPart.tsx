import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import RectPart from "./primitives/RectPart";
import ArcPart, {ArcDirection} from "./primitives/ArcPart";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";

const LOGGER = getLogger(__filename)


interface SimpleTurnoutRailPartProps extends RailPartBaseProps {
  length: number
  radius: number
  centerAngle: number
  direction: ArcDirection
}


export default class SimpleTurnoutRailPart extends RailPartBase<SimpleTurnoutRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    fillColors: RAIL_PART_FILL_COLORS
  }


  constructor(props: SimpleTurnoutRailPartProps) {
    super(props)
  }

  get pivots() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 0, pivot: Pivot.RIGHT},
      {pivotPartIndex: 1, pivot: Pivot.RIGHT}
    ]
  }

  get angles() {
    return [
      this.props.angle,
      this.props.angle + 180,
      this.endAngle
    ]
  }

  get endAngle() {
    switch (this.props.direction) {
      case ArcDirection.RIGHT:
        return this.props.angle - this.props.centerAngle + 180
      case ArcDirection.LEFT:
        return this.props.angle + this.props.centerAngle - 180
    }
  }


  renderParts() {
    const { length, radius, centerAngle, direction, pivotJointIndex, data } = this.props
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    return (
      <PartGroup
        pivotPartIndex={pivotPartIndex}
        pivot={pivot}
        data={data}
      >
        <RectPart
          width={length}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          direction={direction}
          radius={radius}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
      </PartGroup>
    )
  }
}
