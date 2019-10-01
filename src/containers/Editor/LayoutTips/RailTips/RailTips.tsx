import * as React from "react";
import {getRailComponent} from "containers/rails/utils";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "stores/layoutStore";
import {EditorStore} from "stores/editorStore";
import {reaction} from "mobx";
import {RailComponentClasses} from "containers/rails";
import RailTip from "containers/Editor/LayoutTips/RailTips/RailTip/RailTip";
import {STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT} from "constants/stores";


export interface RailTipProps {
  layout?: LayoutStore
  editor?: EditorStore
}

export interface RailTipsState {
  shouldConnect: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_EDITOR)
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
            const position = this.props.editor.paper.view.projectToView(tipPos)
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
