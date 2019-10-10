import * as React from "react";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {BuilderStore, PlacingMode} from "stores/builderStore";
import {EditorMode, EditorStore} from "stores/editorStore";
import DistantPlacingDialog from "./DistantPlacingDialog/DistantPlacingDialog";
import {FreeRailPlacerStore} from "stores/freeRailPlacerStore";
import {STORE_BUILDER, STORE_EDITOR, STORE_FREE_RAIL_PLACER} from "constants/stores";


export interface DistantRailPlacerProps {
  editor?: EditorStore
  builder?: BuilderStore
  freeRailPlacer?: FreeRailPlacerStore
}

export interface DistantRailPlacerState {
}


@inject(STORE_EDITOR, STORE_BUILDER, STORE_FREE_RAIL_PLACER)
@observer
export class DistantRailPlacer extends React.Component<DistantRailPlacerProps, DistantRailPlacerState> {

  constructor(props: DistantRailPlacerProps) {
    super(props)
    this.state = {}

    this.onCloseDialog = this.onCloseDialog.bind(this)
  }

  onCloseDialog = () => {
    this.props.freeRailPlacer.setFreePlacingDialog(false)
  }

  render() {

    return (
      <>
        {
          this.props.editor.mode === EditorMode.BUILDER &&
          this.props.builder.placingMode === PlacingMode.FREE &&
          <DistantPlacingDialog
            title={'Distance from the joint'}
            open={this.props.freeRailPlacer.freePlacingDialog}
            onClose={this.onCloseDialog}
          />
        }
      </>)
  }
}

export default compose<DistantRailPlacerProps, DistantRailPlacerProps | any>(
)(DistantRailPlacer)
