import * as React from "react";
import RectPart from "./primitives/RectPart";
import ArcPart, {ArcDirection} from "./primitives/ArcPart";
import {RAIL_PART_WIDTH, RAIL_SPACE} from "constants/parts";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import RailPartBase, {RailPartBaseDefaultProps, RailPartBaseProps} from "components/rails/parts/RailPartBase";
import getLogger from "logging";
import Gap from "components/rails/parts/Gap";

const LOGGER = getLogger(__filename)

interface DoubleCrossTurnoutRailPartProps extends RailPartBaseProps {
  length: number
  centerAngle: number
}


export default class DoubleCrossTurnoutRailPart extends RailPartBase<DoubleCrossTurnoutRailPartProps, {}> {
  public static defaultProps: RailPartBaseDefaultProps = RailPartBase.defaultProps

  constructor(props: DoubleCrossTurnoutRailPartProps) {
    super(props)
  }

  get joints() {
    return [
      [
        {pivotPartIndex: 0, pivot: Pivot.LEFT},
        {pivotPartIndex: 1, pivot: Pivot.RIGHT},
        {pivotPartIndex: 2, pivot: Pivot.LEFT},
        {pivotPartIndex: 3, pivot: Pivot.RIGHT}
      ],
      [
        {pivotPartIndex: 4, pivot: Pivot.LEFT},
        {pivotPartIndex: 5, pivot: Pivot.RIGHT},
        {pivotPartIndex: 6, pivot: Pivot.LEFT},
        {pivotPartIndex: 7, pivot: Pivot.RIGHT}
      ]
    ][this.props.conductionState]
  }

  get feederSockets() {
    return []
  }

  get conductiveParts() {
    return [[0, 1, 2, 3], [4, 5, 6, 7]][this.props.conductionState]
  }


  renderParts = () => {
    const {length, centerAngle, fillColor, flowDirections, showGap} = this.props

    // TODO: 方程式を解いてちゃんと値を出す
    const radius = length / (2 * Math.sin(centerAngle / 180 * Math.PI))

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
        <RectPart
          position={{x: 0, y: RAIL_SPACE}}
          width={RAIL_PART_WIDTH}
          height={length / 2}
          pivot={Pivot.LEFT}
          fillColor={fillColor}
          flowDirection={flowDirections[2]}
          data={{
            type: 'Part'
          }}
        />
        <RectPart
          position={{x: length / 2, y: RAIL_SPACE}}
          width={RAIL_PART_WIDTH}
          height={length / 2}
          pivot={Pivot.LEFT}
          fillColor={fillColor}
          flowDirection={flowDirections[3]}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          direction={ArcDirection.RIGHT}
          radius={radius}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          fillColor={fillColor}
          flowDirection={flowDirections[4]}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          position={{x: length, y: 0}}
          direction={ArcDirection.RIGHT}
          angle={-centerAngle}
          radius={radius}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.RIGHT}
          fillColor={fillColor}
          flowDirection={flowDirections[5]}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          position={{x: 0, y: RAIL_SPACE}}
          direction={ArcDirection.LEFT}
          radius={radius}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.LEFT}
          fillColor={fillColor}
          flowDirection={flowDirections[6]}
          data={{
            type: 'Part'
          }}
        />
        <ArcPart
          position={{x: length, y: RAIL_SPACE}}
          direction={ArcDirection.LEFT}
          angle={centerAngle}
          radius={radius}
          centerAngle={centerAngle}
          width={RAIL_PART_WIDTH}
          pivot={Pivot.RIGHT}
          fillColor={fillColor}
          flowDirection={flowDirections[7]}
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
        <Gap
          position={{x: length / 2, y: RAIL_SPACE}}
          visible={showGap}
          data={{
            type: 'Gap',
          }}
        />
        <Gap
          position={{x: length / 2, y: RAIL_SPACE / 2}}
          angle={centerAngle}
          visible={showGap}
          data={{
            type: 'Gap',
          }}
        />
        <Gap
          position={{x: length / 2, y: RAIL_SPACE / 2}}
          angle={-centerAngle}
          visible={showGap}
          data={{
            type: 'Gap',
          }}
        />
      </>
    )
  }
}
