import * as React from "react";
import RectPart from "./primitives/RectPart";
import {RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
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
    const {length, fillColor, flowDirections, showGap} = this.props

    return (
      <>
        <RectPart
          width={RAIL_PART_WIDTH}
          height={length / 2}
          pivot={Pivot.LEFT}
          fillColor={fillColor}
          flowDirection={flowDirections[0]}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={{x: length / 2, y: 0}}
          width={RAIL_PART_WIDTH}
          height={length / 2}
          pivot={Pivot.LEFT}
          fillColor={fillColor}
          flowDirection={flowDirections[1]}
          data={{
            type: 'Part'
          }}
        />
        <Gap
          position={{x: length / 2, y: 0}}
          visible={showGap}
          data={{
            type: 'Gap',
          }}
        />
      </>
    )
  }
}
