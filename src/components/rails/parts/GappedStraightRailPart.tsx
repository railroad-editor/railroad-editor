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
import Gap from "components/rails/parts/Gap";

const LOGGER = getLogger(__filename)

interface GappedStraightRailPartProps extends RailPartBaseProps {
  length: number
}


export default class GappedStraightRailPart extends RailPartBase<GappedStraightRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = RailPartBase.defaultProps

  constructor(props: GappedStraightRailPartProps) {
    super(props)
  }

  // Pivotにするジョイントの位置を指定するための情報
  get joints() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
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
    const { length, pivotJointIndex, data, fillColors, flowDirections, showGap } = this.props
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
          fillColor={fillColors[0]}
          flowDirection={flowDirections[0]}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={new Point(length/2, 0)}
          width={length/2}
          height={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          fillColor={fillColors[0]}
          flowDirection={flowDirections[1]}
          data={{
            type: 'Part'
          }}
        />
        {showGap &&
          <Gap
            position={new Point(length/2, 0)}
            data={{
              type: 'Gap',
            }}
          />
        }
      </PartGroup>
    )
  }
}
