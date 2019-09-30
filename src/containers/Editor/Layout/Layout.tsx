import * as React from "react";
import {Layer} from "react-paper-bindings";
import {createRailComponent} from "containers/rails/utils";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import {DEFAULT_SELECTED_COLOR, DEFAULT_SELECTED_WIDTH} from "constants/tools";
import {STORE_BUILDER, STORE_LAYOUT} from "../../../store";

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
export class Layout extends React.Component<LayoutProps, LayoutState> {

  constructor(props: LayoutProps) {
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
                  .map(item => createRailComponent(item, layer,
                    this.props.layout.feedersByRailId(item.id),
                    this.props.layout.gapJoinersByRailId(item.id)))
              }
            </Layer>
          )
        }
      </>
    )
  }
}


export default compose<LayoutProps, LayoutProps | any>(
)(Layout)
