import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import RectPart from "./primitives/RectPart";
import ArcPart, {ArcDirection} from "./primitives/ArcPart";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH, RAIL_SPACE} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";

const LOGGER = getLogger(__filename)

interface DoubleCrossTurnoutRailPartProps extends RailPartBaseProps {
  length: number
}


export default class DoubleCrossTurnoutRailPart extends RailPartBase<DoubleCrossTurnoutRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    fillColors: RAIL_PART_FILL_COLORS,
  }

  constructor(props: DoubleCrossTurnoutRailPartProps) {
    super(props)
  }

  get joints() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 1, pivot: Pivot.RIGHT},
      {pivotPartIndex: 2, pivot: Pivot.LEFT},
      {pivotPartIndex: 3, pivot: Pivot.RIGHT}
    ]
  }

  get glues() {
    return [[]]
  }

  get gaps() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.RIGHT},
      {pivotPartIndex: 2, pivot: Pivot.RIGHT},
      {pivotPartIndex: 4, pivot: Pivot.RIGHT},
      {pivotPartIndex: 5, pivot: Pivot.LEFT},
    ]
  }

  get feederSockets() {
    return []
  }


  get conductives() {
    return [[0]]
  }


  renderParts = () => {
    const { length, pivotJointIndex, data } = this.props

    // TODO: 方程式を解いてちゃんと値を出す
    const radius = length / (2 * Math.sin(15 / 180 * Math.PI))
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    return (
      <PartGroup
        pivotPartIndex={pivotPartIndex}
        pivot={pivot}
        data={data}
      >
        <RectPart
          width={length/2}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(length/2, 0)}
          width={length/2}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(0, RAIL_SPACE)}
          width={length/2}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(length/2, RAIL_SPACE)}
          width={length/2}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          direction={ArcDirection.RIGHT}
          radius={radius}
          centerAngle={15}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          position={new Point(length, 0)}
          direction={ArcDirection.RIGHT}
          angle={-15}
          radius={radius}
          centerAngle={15}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.RIGHT}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          position={new Point(0, RAIL_SPACE)}
          direction={ArcDirection.LEFT}
          radius={radius}
          centerAngle={15}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          position={new Point(length, RAIL_SPACE)}
          direction={ArcDirection.LEFT}
          angle={15}
          radius={radius}
          centerAngle={15}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.RIGHT}
          data={{
            type: 'Part'
          }}
        />
      </PartGroup>
    )
  }
}
