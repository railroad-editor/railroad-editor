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
import {RailComponentClasses} from "components/rails";
import RailTip from "components/Editor/LayoutTips/RailTips/RailTip/RailTip";

const LOGGER = getLogger(__filename)


export interface RailTipProps {
  layout?: LayoutStore
  common?: CommonStore
}

export interface RailTipsState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_COMMON)
@observer
export class RailTips extends React.Component<RailTipProps & WithBuilderPublicProps, RailTipsState> {

  constructor(props: RailTipProps & WithBuilderPublicProps) {
    super(props)

    reaction(() => this.props.common.zooming,
      () => this.forceUpdate() )
  }


  render() {

    const turnoutRails = this.props.layout.currentLayoutData.rails
      .filter(rail => RailComponentClasses[rail.type].defaultProps.numConductionStates > 1)

    return (
      <>
        {
          turnoutRails.map(rail => {
            const c = getRailComponent(rail.id)
            const tipPos = c.railPart.getPivotPositionToParent(c.railPart.tip)
            const position = window.PAPER_SCOPE.view.projectToView(tipPos)
            return (
              <RailTip open={true} position={position} rail={rail} />
            )
          })
        }
      </>
    )
  }
}


export default compose<RailTipProps, RailTipProps|any>(
)(RailTips)
