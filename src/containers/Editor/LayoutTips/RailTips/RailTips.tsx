import * as React from "react";
import {getRailComponent} from "containers/rails/utils";
import getLogger from "logging";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT, STORE_PAPER} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {EditorStore} from "store/editorStore";
import {reaction} from "mobx";
import {RailComponentClasses} from "containers/rails";
import RailTip from "containers/Editor/LayoutTips/RailTips/RailTip/RailTip";
import {PaperStore} from "../../../../store/paperStore.";

const LOGGER = getLogger(__filename)


export interface RailTipProps {
  layout?: LayoutStore
  editor?: EditorStore
  paper?: PaperStore
}

export interface RailTipsState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_EDITOR, STORE_PAPER)
@observer
export class RailTips extends React.Component<RailTipProps, RailTipsState> {

  constructor(props: RailTipProps) {
    super(props)

    reaction(() => this.props.editor.zooming,
      () => this.forceUpdate())
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
            const position = this.props.paper.scope.view.projectToView(tipPos)
            const switcher = this.props.layout.getSwitcherByRailId(rail.id)
            const color = switcher ? switcher.color : null
            return (
              <RailTip
                open={true}
                position={position}
                rail={rail}
                color={color}
                switchers={this.props.layout.currentLayoutData.switchers}
              />
            )
          })
        }
      </>
    )
  }
}


export default compose<RailTipProps, RailTipProps | any>(
)(RailTips)
