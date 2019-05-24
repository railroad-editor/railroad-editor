import * as React from "react";
import {Layer} from "react-paper-bindings";
import {createRailComponent} from "components/rails/utils";
import getLogger from "logging";
import {default as withBuilder, WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import {DEFAULT_SELECTED_COLOR, DEFAULT_SELECTED_WIDTH} from "constants/tools";

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
  }


  render() {
    const {currentLayoutData} = this.props.layout;

    LOGGER.debug('Layout render()')

    return (
      <>
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
                  .map(item => createRailComponent(item, layer, currentLayoutData.feeders, currentLayoutData.gapJoiners))
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
