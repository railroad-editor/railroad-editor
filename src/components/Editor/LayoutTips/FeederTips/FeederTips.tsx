import * as React from "react";
import {Layer} from "react-paper-bindings";
import {getRailComponent} from "components/rails/utils";
import getLogger from "logging";
import {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {Tooltip} from "@material-ui/core";
import {CommonStore} from "store/commonStore";
import {reaction} from "mobx";
import FeederTip from "components/Editor/LayoutTips/FeederTips/FeederTip/FeederTip";

const LOGGER = getLogger(__filename)


export interface FeederTipProps {
  layout?: LayoutStore
  common?: CommonStore
}

export interface FeederTipState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_COMMON)
@observer
export class FeederTips extends React.Component<FeederTipProps & WithBuilderPublicProps, FeederTipState> {

  constructor(props: FeederTipProps & WithBuilderPublicProps) {
    super(props)
    reaction(() => this.props.common.zoom,
      () => this.forceUpdate() )
  }


  render() {

    const layout = this.props.layout.currentLayoutData

    return (
      <>
        {
          layout.feeders.map(feeder => {
            const c = getRailComponent(feeder.railId)
            const tipPos = c.railPart.getPivotPositionToParent(c.railPart.feederSockets[feeder.socketId])
            const position = window.PAPER_SCOPE.view.projectToView(tipPos)
            return (
              <FeederTip open={true} position={position} feeder={feeder} />
            )
          })
        }
      </>
    )
  }
}


export default compose<FeederTipProps, FeederTipProps|any>(
)(FeederTips)
