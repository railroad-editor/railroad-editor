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
export class RailTip extends React.Component<RailTipProps & WithBuilderPublicProps, RailTipsState> {

  constructor(props: RailTipProps & WithBuilderPublicProps) {
    super(props)

    reaction(() => this.props.common.zoom,
      () => this.forceUpdate() )
  }


  render() {

    const layout = this.props.layout.currentLayoutData

    return (
      <>
        {
          layout.rails.map(rail => {
            const c = getRailComponent(rail.id)
            const tipPos = c.railPart.getPivotPositionToParent(c.railPart.tip)
            const position = window.PAPER_SCOPE.view.projectToView(tipPos)
            const top = position.y
            const left = position.x
            return (
              <Tooltip open={true} title={'unko'}>
                <div style={{top: `${top}px`, left: `${left}px`, width: '1px', height: '1px', position: 'absolute'}}/>
              </Tooltip>
            )
          })
        }
      </>
    )
  }
}


export default compose<RailTipProps, RailTipProps|any>(
)(RailTip)
