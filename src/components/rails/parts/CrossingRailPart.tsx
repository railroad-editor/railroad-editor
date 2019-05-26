import * as React from "react";
import {Point} from "paper";
import RectPart from "./primitives/RectPart";
import {RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";

const LOGGER = getLogger(__filename)

interface CrossingRailPartProps extends RailPartBaseProps {
  length: number
  crossAngle: number
}


export default class CrossingRailPart extends RailPartBase<CrossingRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = RailPartBase.defaultProps

  constructor(props: CrossingRailPartProps) {
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
    return []
  }

  get conductiveParts() {
    return [0, 1]
  }

  renderParts = () => {
    const {length, crossAngle, fillColors, flowDirections} = this.props

    return (
      <>
        <RectPart
          position={new Point(0, 0)}
          width={RAIL_PART_WIDTH}
          height={length}
          pivot={Pivot.CENTER}
          fillColor={fillColors[0]}
          flowDirection={flowDirections[0]}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(0, 0)}
          angle={crossAngle}
          width={RAIL_PART_WIDTH}
          height={length}
          pivot={Pivot.CENTER}
          fillColor={fillColors[0]}
          flowDirection={flowDirections[1]}
          data={{
            type: 'Part'
          }}
        />
      </>
    )
  }
}
