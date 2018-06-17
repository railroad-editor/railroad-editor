import * as React from "react";
import {Layer} from "react-paper-bindings";
import getLogger from "logging";
import {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_COMMON} from "constants/stores";
import {inject, observer} from "mobx-react";
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";
import FeederTips from "components/Editor/LayoutTips/FeederTips/FeederTips";
import RailTips from "components/Editor/LayoutTips/RailTips/RailTips";

const LOGGER = getLogger(__filename)


export interface RailTipsProps {
  common?: CommonStore
}

export interface RailTipsState {
}


@inject(STORE_COMMON)
@observer
export class LayoutTips extends React.Component<RailTipsProps & WithBuilderPublicProps, RailTipsState> {

  constructor(props: RailTipsProps & WithBuilderPublicProps) {
    super(props)
  }

  render() {
    const {editorMode, zooming, panning} = this.props.common
    return (
      <>
        {
          editorMode === EditorMode.SIMULATOR && !zooming && !panning &&
          <>
            <FeederTips />
            <RailTips />
          </>
        }
      </>
    )
  }
}


export default compose<RailTipsProps, RailTipsProps|any>(
)(LayoutTips)
