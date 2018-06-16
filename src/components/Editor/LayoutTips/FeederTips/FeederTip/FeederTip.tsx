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
import {Point} from "paper";
import FeederSettingDialog
  from "components/Editor/LayoutTips/FeederTips/FeederTip/FeederSettingDialog/FeederSettingDialog";
import {FeederInfo} from "components/rails/RailBase";
import {StyledTooltip} from "components/Editor/LayoutTips/FeederTips/FeederTip/FeederTip.style";

const LOGGER = getLogger(__filename)


export interface FeederTipProps {
  feeder: FeederInfo
  position: Point
  open: boolean
  layout?: LayoutStore
  common?: CommonStore
}

export interface FeederTipState {
  dialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_COMMON)
@observer
export class FeederTip extends React.Component<FeederTipProps & WithBuilderPublicProps, FeederTipState> {

  constructor(props: FeederTipProps & WithBuilderPublicProps) {
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


  render() {
    const {feeder, open, position} = this.props

    return (
      <>
        <StyledTooltip open={open} title={feeder.name}
                       PopperProps={{onClick: this.onClick, style: {cursor: 'pointer'}}}>
          <div style={{top: `${position.y}px`, left: `${position.x}px`, width: '1px', height: '1px', position: 'absolute'}}/>
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
