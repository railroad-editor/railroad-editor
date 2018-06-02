import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import ArcPart, {ArcDirection} from "./primitives/ArcPart";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";

const LOGGER = getLogger(__filename)

interface CurvedTurnoutRailPartProps extends RailPartBaseProps {
  innerRadius: number
  outerRadius: number
  innerCenterAngle: number
  outerCenterAngle: number
  direction: ArcDirection
}


export default class CurvedTurnoutRailPart extends RailPartBase<CurvedTurnoutRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    fillColors: RAIL_PART_FILL_COLORS
  }


  constructor(props: CurvedTurnoutRailPartProps) {
    super(props)
  }

  get joints() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 0, pivot: Pivot.RIGHT},
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
    return []
  }

  get conductives() {
    return [[0], [1]]
  }

  renderParts = () => {
    const { innerRadius, outerRadius, innerCenterAngle, outerCenterAngle, direction, pivotJointIndex, data } = this.props
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    return (
      <PartGroup
        pivotPartIndex={pivotPartIndex}
        pivot={pivot}
        data={data}
      >
        <ArcPart
          direction={direction}
          radius={outerRadius}
          centerAngle={outerCenterAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
        />
        <ArcPart
          direction={direction}
          radius={innerRadius}
          centerAngle={innerCenterAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
        />
      </PartGroup>
    )
  }
}
