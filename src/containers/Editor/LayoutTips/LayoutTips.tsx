import * as React from "react";
import getLogger from "logging";
import {compose} from "recompose";
import {STORE_EDITOR} from "constants/stores";
import {inject, observer} from "mobx-react";
import {EditorStore} from "store/editorStore";
import {EditorMode} from "store/uiStore";
import FeederTips from "containers/Editor/LayoutTips/FeederTips/FeederTips";
import RailTips from "containers/Editor/LayoutTips/RailTips/RailTips";

const LOGGER = getLogger(__filename)


export interface RailTipsProps {
  editor?: EditorStore
}

export interface RailTipsState {
}


@inject(STORE_EDITOR)
@observer
export class LayoutTips extends React.Component<RailTipsProps, RailTipsState> {

  constructor(props: RailTipsProps) {
    super(props)
  }

  render() {
    const {editorMode, zooming, panning} = this.props.editor
    return (
      <>
        {
          editorMode === EditorMode.SIMULATOR && ! zooming && ! panning &&
          <>
            <FeederTips/>
            <RailTips/>
          </>
        }
      </>
    )
  }
}


export default compose<RailTipsProps, RailTipsProps | any>(
)(LayoutTips)
