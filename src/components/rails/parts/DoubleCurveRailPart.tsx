import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH, RAIL_SPACE} from "constants/parts";
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
  public static defaultProps: RailPartBaseDefaultProps = RailPartBase.defaultProps

  constructor(props: DoubleCurveRailPartProps) {
    super(props)
  }

  get joints() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 0, pivot: Pivot.RIGHT},
      {pivotPartIndex: 1, pivot: Pivot.LEFT},
      {pivotPartIndex: 1, pivot: Pivot.RIGHT}
    ]
  }

  get glues() {
    return [[]]
  }

  get gaps() {
    return []
  }

  get feederSockets() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.CENTER},
      {pivotPartIndex: 1, pivot: Pivot.CENTER},
    ]
  }

  get conductiveParts() {
    return [0, 1]
  }


  renderParts = () => {
    const { innerRadius, outerRadius, centerAngle, direction, pivotJointIndex, data, flowDirections } = this.props
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
          flowDirection={flowDirections[0]}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          pivot={Pivot.LEFT}
          direction={direction}
          position={new Point(0, RAIL_SPACE)}
          radius={radius2}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          flowDirection={flowDirections[1]}
          data={{
            type: 'Part'
          }}
        />
      </PartGroup>
    )
  }
}
