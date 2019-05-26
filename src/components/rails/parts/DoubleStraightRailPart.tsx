import * as React from "react";
import {Point} from "paper";
import RectPart from "./primitives/RectPart";
import {RAIL_PART_WIDTH, RAIL_SPACE} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";

const LOGGER = getLogger(__filename)

interface DoubleStraightRailPartProps extends RailPartBaseProps {
  length: number
}


export default class DoubleStraightRailPart extends RailPartBase<DoubleStraightRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = RailPartBase.defaultProps

  constructor(props: DoubleStraightRailPartProps) {
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
    const {length, pivotJointIndex, data, fillColors, flowDirections} = this.props
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
          fillColor={fillColors[0]}
          flowDirection={flowDirections[0]}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(0, RAIL_SPACE)}
          width={length}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          fillColor={fillColors[0]}
          flowDirection={flowDirections[1]}
          data={{
            type: 'Part'
          }}
        />
      </PartGroup>
    )
  }
}
