import * as React from "react";
import {Layer} from "react-paper-bindings";
import {createFeederComponent, createRailOrRailGroupComponent, getRailComponent} from "containers/rails/utils";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {reaction} from "mobx";
import {WithBuilderStore, WithLayoutStore} from "stores";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";


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
        getRailComponent(this.props.builder.currentRailId).props.showTemporaryRailOrRailGroup(this.props.builder.currentJointId)
        this.forceUpdate()
      }
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
          createRailOrRailGroupComponent(temporaryRailGroup, temporaryRails, temporaryLayer)
        }
        {
          temporaryFeeder &&
          createFeederComponent(temporaryFeeder)
        }
      </Layer>
    )
  }
}


export default compose<TemporaryLayerProps, TemporaryLayerProps | any>(
)(TemporaryLayer)
