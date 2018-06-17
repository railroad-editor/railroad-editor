import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_COMMON} from "constants/stores";
import {compose} from "recompose";
import {withSnackbar} from 'material-ui-snackbar-provider'
import BuilderPalette from "components/Editor/BuilderPalettes/BuilderPalette/BuilderPalette";
import {StyledBuilderPalette, StyledLayerPalette} from "components/Editor/BuilderPalettes/BuilderPalettes.style";
import {EditorMode} from "store/uiStore";
import {CommonStore} from "store/commonStore";


export interface PaletteProps {
  common?: CommonStore
}

export interface PaletteState {
}


@inject(STORE_COMMON)
@observer
export class BuilderPalettes extends React.Component<PaletteProps, PaletteState> {

  constructor(props: PaletteProps) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <div hidden={this.props.common.editorMode !== EditorMode.BUILDER}>
        <StyledBuilderPalette />
        <StyledLayerPalette />
      </div>
    )
  }
}


export default compose<PaletteProps, PaletteProps>(
)(BuilderPalettes)

