import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";
import {ArcDirection, default as ArcPart} from "components/rails/parts/primitives/ArcPart";

const LOGGER = getLogger(__filename)

interface DoubleCurveRailPartProps extends RailPartBaseProps {
  innerRadius: number
  outerRadius: number
  centerAngle: number
  direction: ArcDirection
}


export default class DoubleCurveRailPart extends RailPartBase<DoubleCurveRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    fillColors: RAIL_PART_FILL_COLORS
  }

  constructor(props: DoubleCurveRailPartProps) {
    super(props)
  }

  get pivots() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 0, pivot: Pivot.RIGHT},
      {pivotPartIndex: 1, pivot: Pivot.LEFT},
      {pivotPartIndex: 1, pivot: Pivot.RIGHT}
    ]
  }

  get angles() {
    return [
      this.props.angle,
      this.endAngle,
      this.props.angle,
      this.endAngle,
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


  renderParts = () => {
    const { innerRadius, outerRadius, centerAngle, direction, pivotJointIndex, data } = this.props
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    let radius1, radius2
    switch (this.props.direction) {
      case ArcDirection.RIGHT:
        radius1 = outerRadius
        radius2 = innerRadius
        break
      case ArcDirection.LEFT:
        radius1 = innerRadius
        radius2 = outerRadius
        break
    }

    return (
      <PartGroup
        pivotPartIndex={pivotPartIndex}
        pivot={Pivot.LEFT}
        data={data}
      >
        <ArcPart
          pivot={Pivot.LEFT}
          direction={direction}
          radius={radius1}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          pivot={Pivot.LEFT}
          direction={direction}
          position={new Point(0, RailPartBase.RAIL_SPACE)}
          radius={radius2}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          data={{
            type: 'Part'
          }}
        />
      </PartGroup>
    )
  }
}
