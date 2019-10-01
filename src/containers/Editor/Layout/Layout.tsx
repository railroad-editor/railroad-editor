import * as React from "react";
import {Layer} from "react-paper-bindings";
import {createRailComponent} from "containers/rails/utils";
import {inject, observer} from "mobx-react";
import {DEFAULT_SELECTED_COLOR, DEFAULT_SELECTED_WIDTH} from "constants/tools";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {WithLayoutStore} from "stores";


export type LayoutProps = {} & WithLayoutStore

@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export default class Layout extends React.Component<LayoutProps, {}> {

  render() {
    const {currentLayoutData} = this.props.layout;

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

