import * as React from "react";
import RectPart from "./primitives/RectPart";
import {RAIL_PART_WIDTH} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";
import 'lodash.combinations';
import 'lodash.product';

const LOGGER = getLogger(__filename)

interface StraightRailPartProps extends RailPartBaseProps {
  length: number
}


export default class StraightRailPart extends RailPartBase<StraightRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = RailPartBase.defaultProps

  constructor(props: StraightRailPartProps) {
    super(props)
  }

  // Pivotにするジョイントの位置を指定するための情報
  get joints() {
    return [
      {pivotPartIndex: 0, pivot: Pivot.LEFT},
      {pivotPartIndex: 0, pivot: Pivot.RIGHT}
    ]
  }

  get feederSockets() {
    return [{pivotPartIndex: 0, pivot: Pivot.CENTER}]
  }

  get conductiveParts() {
    return [0]
  }

  get tip() {
    return {pivotPartIndex: 0, pivot: Pivot.CENTER}
  }


  renderParts = () => {
    const {length, fillColors, flowDirections} = this.props

    return (
      <>
        <RectPart
          width={RAIL_PART_WIDTH}
          height={length}
          pivot={Pivot.LEFT}
          fillColor={fillColors[0]}
          flowDirection={flowDirections[0]}
          data={{
            type: 'Part'
          }}
        />
      </>
    )
  }
}
