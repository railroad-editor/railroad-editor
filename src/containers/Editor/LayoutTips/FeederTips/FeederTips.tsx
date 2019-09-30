import * as React from "react";
import {getRailComponent} from "containers/rails/utils";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {EditorStore} from "store/editorStore";
import {reaction} from "mobx";
import FeederTip from "containers/Editor/LayoutTips/FeederTips/FeederTip/FeederTip";
import {Pivot} from "react-rail-components/lib/parts/primitives/PartBase";
import {STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT} from "store/constants";

const LOGGER = getLogger(__filename)


export interface FeederTipProps {
  layout?: LayoutStore
  editor?: EditorStore
}

export interface FeederTipState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_EDITOR)
@observer
export class FeederTips extends React.Component<FeederTipProps, FeederTipState> {

  constructor(props: FeederTipProps) {
    super(props)
    reaction(() => this.props.editor.zooming,
      () => this.forceUpdate())
  }


  render() {

    const layout = this.props.layout.currentLayoutData

    return (
      <>
        {
          layout.feeders.map(feeder => {
            const c = getRailComponent(feeder.railId)
            const positionOnCanvas = c.feeders[feeder.socketId].part.getGlobalPosition(Pivot.CENTER)
            const position = this.props.editor.paper.view.projectToView(positionOnCanvas)
            const powerPack = this.props.layout.getPowerPackByFeederId(feeder.id)
            const color = powerPack ? powerPack.color : null
            return (
              <FeederTip open={true} position={position} angle={c.props.angle} feeder={feeder} color={color}/>
            )
          })
        }
      </>
    )
  }
}


export default compose<FeederTipProps, FeederTipProps | any>(
)(FeederTips)
