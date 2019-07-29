import * as React from "react";
import {getRailComponent} from "components/rails/utils";
import getLogger from "logging";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_PAPER} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {CommonStore} from "store/commonStore";
import {reaction} from "mobx";
import FeederTip from "components/Editor/LayoutTips/FeederTips/FeederTip/FeederTip";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import {PaperStore} from "../../../../store/paperStore.";

const LOGGER = getLogger(__filename)


export interface FeederTipProps {
  layout?: LayoutStore
  common?: CommonStore
  paper?: PaperStore
}

export interface FeederTipState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_COMMON, STORE_PAPER)
@observer
export class FeederTips extends React.Component<FeederTipProps, FeederTipState> {

  constructor(props: FeederTipProps) {
    super(props)
    reaction(() => this.props.common.zooming,
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
            const position = this.props.paper.scope.view.projectToView(positionOnCanvas)
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
