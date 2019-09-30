import * as React from "react";
import {normAngle} from "containers/rails/utils";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {Tooltip, withStyles} from "@material-ui/core";
import {EditorStore} from "store/editorStore";
import FeederSettingDialog
  from "containers/Editor/LayoutTips/FeederTips/FeederTip/FeederSettingDialog/FeederSettingDialog";
import {FlowDirection} from "react-rail-components/lib/parts/primitives/PartBase";
import {FeederInfo} from "react-rail-components";
import {STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT} from "../../../../../store/constants";

const LOGGER = getLogger(__filename)

const createColoredTooltip = (color: string) => withStyles({
  tooltip: {
    backgroundColor: color
  }
})(Tooltip);


export interface FeederTipProps {
  feeder: FeederInfo
  position: Point2D
  angle: number
  open: boolean
  color?: string
  layout?: LayoutStore
  editor?: EditorStore
}

export interface FeederTipState {
  dialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_EDITOR)
@observer
export class FeederTip extends React.Component<FeederTipProps, FeederTipState> {

  constructor(props: FeederTipProps) {
    super(props)
    this.state = {
      dialogOpen: false
    }
  }

  onClick = (e) => {
    this.setState({
      dialogOpen: true
    })
  }

  onCloseDialog = () => {
    this.setState({
      dialogOpen: false
    })
  }

  getPlacement = () => {
    let b = 0
    switch (this.props.feeder.direction) {
      case FlowDirection.LEFT_TO_RIGHT:
        b = 0
        break
      case FlowDirection.RIGHT_TO_LEFT:
        b = 180
        break
    }
    const a = normAngle(this.props.angle + b)
    if (0 <= a && a < 22.5) {
      return 'bottom'
    } else if (22.5 <= a && a < 67.5) {
      return 'bottom-end'
    } else if (67.5 <= a && a < 112.5) {
      return 'right'
    } else if (112.5 <= a && a < 157.5) {
      return 'top-end'
    } else if (157.5 <= a && a < 202.5) {
      return 'top'
    } else if (202.5 <= a && a < 247.5) {
      return 'top-start'
    } else if (247.5 <= a && a < 292.5) {
      return 'left'
    } else if (292.5 <= a && a <= 337.5) {
      return 'bottom-start'
    } else {
      return 'bottom'
    }
  }

  render() {
    const {feeder, open, position, angle, color} = this.props
    const placement = this.getPlacement()
    const StyledTooltip = createColoredTooltip(color)

    return (
      <>
        <StyledTooltip open={open} title={feeder.name}
                       PopperProps={{onClick: this.onClick, style: {cursor: 'pointer', zIndex: 900}}}
                       placement={placement}
                       classes={{tooltip: 'tooltip'}}
                       interactive
        >
          <div style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
            width: '1px',
            height: '1px',
            position: 'absolute'
          }}/>
        </StyledTooltip>
        <FeederSettingDialog
          title={'Feeder Setting'}
          open={this.state.dialogOpen}
          onClose={this.onCloseDialog}
          feeder={feeder}
          powerPacks={this.props.layout.currentLayoutData.powerPacks}
        />
      </>
    )
  }
}


export default compose<FeederTipProps, FeederTipProps>(
)(FeederTip)
