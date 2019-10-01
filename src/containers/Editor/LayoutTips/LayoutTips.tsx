import * as React from "react";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {EditorMode, EditorStore} from "stores/editorStore";
import FeederTips from "containers/Editor/LayoutTips/FeederTips/FeederTips";
import RailTips from "containers/Editor/LayoutTips/RailTips/RailTips";
import {STORE_EDITOR} from "constants/stores";

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
    const {mode, zooming, panning} = this.props.editor
    return (
      <>
        {
          mode === EditorMode.SIMULATOR && ! zooming && ! panning &&
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
