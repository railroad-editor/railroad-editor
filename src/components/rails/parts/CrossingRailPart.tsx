import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import RectPart from "./primitives/RectPart";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";

const LOGGER = getLogger(__filename)

interface CrossingRailPartProps extends RailPartBaseProps {
  length: number
  crossAngle: number
}


export default class CrossingRailPart extends RailPartBase<CrossingRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    fillColors: RAIL_PART_FILL_COLORS
  }

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

  get glues() {
    return [[]]
  }

  get gaps() {
    return []
  }

  get conductives() {
    return [[0, 1]]
  }

  get feederSockets() {
    return []
  }


  renderParts = () => {
    const { length, crossAngle, pivotJointIndex, data } = this.props
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    return (
      <PartGroup
        pivotPartIndex={pivotPartIndex}
        pivot={pivot}
        data={data}
      >
        <RectPart
          position={new Point(0, 0)}
          width={length}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.CENTER}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(0, 0)}
          angle={crossAngle}
          width={length}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.CENTER}
          data={{
            type: 'Part'
          }}
        />
      </PartGroup>
    )
  }
}
