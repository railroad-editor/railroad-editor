import * as React from "react";
import {Layer} from "react-paper-bindings";
import {createRailComponent, createRailOrRailGroupComponent, getAllOpenCloseJoints} from "components/rails/utils";
import getLogger from "logging";
import {default as withBuilder, WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import {DEFAULT_SELECTED_COLOR, DEFAULT_SELECTED_WIDTH} from "constants/tools";
import {reaction} from "mobx";

const LOGGER = getLogger(__filename)


export interface LayoutProps {
  layout?: LayoutStore
  builder?: BuilderStore
}

export interface LayoutState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export class Layout extends React.Component<LayoutProps & WithBuilderPublicProps, LayoutState> {

  constructor(props: LayoutProps & WithBuilderPublicProps) {
    super(props)
    // this.state = {
    //   shouldConnect: false
    // }

    // const reaction1 = reaction(
    //   () => this.props.layout.activeLayerRails.length,
    //   length => this.setState({ shouldConnect: true })
    //   )
  }

  // componentDidUpdate() {
  //   LOGGER.info('Layout update()', this.props.layout.currentLayoutData.rails.length)
  //   if (this.state.shouldConnect) {
  //     this.props.builderConnectJoints(this.props.layout.unconnectedCloseJoints)
  //     this.setState({ shouldConnect: false })
  //   }
  // }


  render() {
    const {temporaryRails, temporaryRailGroup} = this.props.builder
    const {currentLayoutData, activeLayerData} = this.props.layout;
    const temporaryLayer = {
      id: -1,
      name: 'Temporary',
      color: activeLayerData.color,
      visible: undefined,   // TemporaryRailはLayerとは無関係に状態を切り替えたいので、undefinedを入れる
      opacity: undefined    // 同上
    }

    LOGGER.debug('Layout render()')

    return (
      <>
        <Layer
          key={-1}
          data={{id: -1, name: 'TemporaryLayer'}}
        >
          {
            temporaryRails.length > 0 &&
            createRailOrRailGroupComponent(temporaryRailGroup, temporaryRails, temporaryLayer)
          }
        </Layer>
        {
          currentLayoutData.layers.map(layer =>
            <Layer
              data={layer}
              key={layer.id}
              visible={layer.visible}
              opacity={layer.opacity}
              selectedWidth={DEFAULT_SELECTED_WIDTH}
              selectedColor={DEFAULT_SELECTED_COLOR}
            >
              {
                currentLayoutData.rails
                  .filter(r => r.layerId === layer.id)
                  .map(item => createRailComponent(item, layer))
              }
            </Layer>
          )
        }
      </>
    )
  }
}


export default compose<LayoutProps, LayoutProps|any>(
  withBuilder,
)(Layout)
