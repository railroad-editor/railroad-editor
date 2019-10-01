import * as React from "react";
import {inject, observer} from "mobx-react";
import {EditorMode} from "stores/editorStore";
import FeederTips from "containers/Editor/LayoutTips/FeederTips/FeederTips";
import RailTips from "containers/Editor/LayoutTips/RailTips/RailTips";
import {STORE_EDITOR} from "constants/stores";
import {WithEditorStore} from "stores";


export type RailTipsProps = {} & WithEditorStore


@inject(STORE_EDITOR)
@observer
export default class LayoutTips extends React.Component<RailTipsProps, {}> {

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

