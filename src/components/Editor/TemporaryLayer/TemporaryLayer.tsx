import * as React from "react";
import {Layer} from "react-paper-bindings";
import {
  createFeederComponent,
  createRailOrRailGroupComponent} from "components/rails/utils";
import getLogger from "logging";
import {default as withBuilder, WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";

const LOGGER = getLogger(__filename)


export interface TemporaryLayerProps {
  layout?: LayoutStore
  builder?: BuilderStore
}

export interface LayoutState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export class TemporaryLayer extends React.Component<TemporaryLayerProps & WithBuilderPublicProps, LayoutState> {

  constructor(props: TemporaryLayerProps & WithBuilderPublicProps) {
    super(props)
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


export default compose<TemporaryLayerProps, TemporaryLayerProps|any>(
  withBuilder,
)(TemporaryLayer)
