import * as React from "react";
import {Layer} from "react-paper-bindings";
import getLogger from "logging";
import {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {CommonStore} from "store/commonStore";
import {reaction} from "mobx";
import {EditorMode} from "store/uiStore";
import FeederTips from "components/Editor/LayoutTips/FeederTips/FeederTips";

const LOGGER = getLogger(__filename)


export interface RailTipsProps {
  layout?: LayoutStore
  common?: CommonStore
}

export interface RailTipsState {
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_COMMON)
@observer
export class LayoutTips extends React.Component<RailTipsProps & WithBuilderPublicProps, RailTipsState> {

  constructor(props: RailTipsProps & WithBuilderPublicProps) {
    super(props)
  }

  render() {
    return (
      <>
        {/*<RailTip />*/}
        {
          this.props.common.editorMode === EditorMode.SIMULATOR &&
          <FeederTips />
        }
      </>
    )
  }
}


export default compose<RailTipsProps, RailTipsProps|any>(
)(LayoutTips)
