import * as React from "react";
import {Layer} from "react-paper-bindings";
import getLogger from "logging";
import {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore, SwitcherData} from "store/layoutStore";
import {CommonStore} from "store/commonStore";
import {Point} from "paper";
import {StyledTooltip} from "components/Editor/LayoutTips/FeederTips/FeederTip/FeederTip.style";
import TurnoutSettingDialog
  from "components/Editor/LayoutTips/RailTips/RailTip/TurnoutSettingDialog/TurnoutSettingDialog";
import {RailData} from "components/rails";

const LOGGER = getLogger(__filename)


export interface FeederTipProps {
  rail: RailData
  switchers: SwitcherData[]
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
export class RailTip extends React.Component<FeederTipProps & WithBuilderPublicProps, FeederTipState> {

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
    const {rail, switchers, open, position} = this.props

    return (
      <>
        <StyledTooltip open={open} title={rail.name}
                       PopperProps={{onClick: this.onClick, style: {cursor: 'pointer'}}}>
          <div style={{top: `${position.y}px`, left: `${position.x}px`, width: '1px', height: '1px', position: 'absolute'}}/>
        </StyledTooltip>
        <TurnoutSettingDialog
          title={'Turnout Setting'}
          open={this.state.dialogOpen}
          onClose={this.onCloseDialog}
          rail={rail}
          switchers={switchers}
        />
      </>
    )
  }
}


export default compose<FeederTipProps, FeederTipProps>(
)(RailTip)
