import * as React from "react";
import {Layer} from "react-paper-bindings";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {reaction} from "mobx";
import {WithBuilderStore, WithLayoutStore} from "stores";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import RailComponentRegistry from "containers/rails/RailComponentRegistry";
import {FeederInfo} from "react-rail-components";
import Feeder from "react-rail-components/lib/parts/Feeder";
import {FEEDER_SOCKET_FILL_COLORS} from "react-rail-components/lib/constants";
import {Pivot} from "react-rail-components/lib/parts/primitives/PartBase";


export type TemporaryLayerProps = {
  // empty
} & WithBuilderStore & WithLayoutStore

export interface LayoutState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export class TemporaryLayer extends React.Component<TemporaryLayerProps, LayoutState> {

  constructor(props: TemporaryLayerProps) {
    super(props)

    // 微調整角度が変更された時、仮レールを再描画する
    reaction(
      () => this.props.builder.adjustmentAngle,
      (adjustmentAngle) => {
        // 現在仮レールを表示しているレールであれば、仮レールを再描画する
        // 仮レールを設置する
        const rail = RailComponentRegistry.getRailById(this.props.builder.currentRailId)
        rail.props.showTemporaryRailOrRailGroup(this.props.builder.currentJointId)
        // ジョイントの状態を更新する
        // rail.props.onJointMouseMove(this.props.builder.currentJointId, null)
        this.forceUpdate()
      }
    )
  }

  renderRailOrRailGroup = (railGroup, rails, layer) => {
    if (railGroup) {
      return RailComponentRegistry.createRailGroup(railGroup, rails, layer)
    } else {
      return rails.map(r => RailComponentRegistry.createRail(r, layer))
    }
  }

  renderFeeder = (feeder: FeederInfo) => {
    const rail = RailComponentRegistry.getRailById(feeder.railId)
    const pivotInfo = {pivotPartIndex: feeder.socketId, pivot: feeder.pivot}
    return (
      <Feeder
        {...feeder}
        position={rail.railPart.getPivotPositionToParent(pivotInfo)}
        angle={rail.railPart.getPivotAngleToParent(pivotInfo)}
        fillColor={FEEDER_SOCKET_FILL_COLORS[2]}
        opacity={0.8}
        pivot={Pivot.TOP}
      />
    )
  }

  render() {
    const {temporaryRails, temporaryRailGroup, temporaryFeeder} = this.props.builder
    const {activeLayerData} = this.props.layout;
    const temporaryLayer = {
      id: -1,
      name: 'Temporary',
      color: activeLayerData.color,
      visible: undefined,   // TemporaryRailはLayerとは無関係に状態を切り替えたいので、undefinedを入れる
      opacity: undefined    // 同上
    }

    return (
      <Layer
        key={-1}
        data={{id: -1, name: 'TemporaryLayer'}}
      >
        {
          temporaryRails.length > 0 &&
          this.renderRailOrRailGroup(temporaryRailGroup, temporaryRails, temporaryLayer)
        }
        {
          temporaryFeeder &&
          this.renderFeeder(temporaryFeeder)
        }
      </Layer>
    )
  }
}


export default compose<TemporaryLayerProps, TemporaryLayerProps | any>(
)(TemporaryLayer)
