import * as React from "react";
import {Layer} from "react-paper-bindings";
import {createRailComponent, createRailOrRailGroupComponent} from "components/rails/utils";
import getLogger from "logging";
import {default as withBuilder} from "components/hoc/withBuilder";
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


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export class Layout extends React.Component<LayoutProps, {}> {

  constructor(props: LayoutProps) {
    super(props)
  }


  render() {
    const {temporaryRails, temporaryRailGroup} = this.props.builder
    const {currentLayoutData, activeLayerData} = this.props.layout;

    LOGGER.debug('Layout render()')

    return (
      <React.Fragment>
        <Layer
          key={-1}
          data={{id: -1, name: 'TemporaryLayer'}}
        >
          {
            temporaryRails.length > 0 &&
            createRailOrRailGroupComponent(temporaryRailGroup, temporaryRails,
              { id: -1, name: 'Temporary', visible: true, color: activeLayerData.color})
          }
        </Layer>
        {
          currentLayoutData.layers.map(layer =>
            <Layer
              data={layer}
              visible={layer.visible}
              key={layer.id}
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
      </React.Fragment>
    )
  }
}


export default compose<LayoutProps, LayoutProps|any>(
  withBuilder,
)(Layout)
