import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import RectPart from "./primitives/RectPart";
import {RAIL_PART_FILL_COLORS, RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";
import 'lodash.combinations';
import 'lodash.product';

const LOGGER = getLogger(__filename)

interface StraightRailPartProps extends RailPartBaseProps {
  length: number
  hasGap?: boolean
}


export default class StraightRailPart extends RailPartBase<StraightRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    fillColors: RAIL_PART_FILL_COLORS
  }

  constructor(props: StraightRailPartProps) {
    super(props)
  }

  // Pivotにするジョイントの位置を指定するための情報
  get joints() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 1, pivot: Pivot.RIGHT}
    ]
  }

  get glues() {
    if (this.props.hasGap) {
      return [[]]
    } else {
      return [
        [
          {pivotPartIndex: 0, pivot: Pivot.RIGHT},
          {pivotPartIndex: 1, pivot: Pivot.LEFT},
        ],
      ]
    }
  }

  get gaps() {
    if (this.props.hasGap) {
      return [{pivotPartIndex: 0, pivot: Pivot.RIGHT}]
    } else {
      return []
    }
  }

  get conductives() {
    return [
      [0, 1]
    ]
  }


  renderParts = () => {
    const { length, pivotJointIndex, data } = this.props
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)
    return (
      <PartGroup
        pivotPartIndex={pivotPartIndex}
        pivot={Pivot.LEFT}
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
      </PartGroup>
    )
  }
}
