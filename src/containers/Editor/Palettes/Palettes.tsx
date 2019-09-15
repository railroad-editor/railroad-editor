import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_EDITOR} from "constants/stores";
import {compose} from "recompose";
import {EditorMode} from "store/uiStore";
import {EditorStore} from "store/editorStore";
import BuilderPalettes from "./BuilderPalettes/BuilderPalettes";
import {SimulatorPalettes} from "./SimulatorPalettes/SimulatorPalettes";


export interface PalettesProps {
  editor?: EditorStore
}

@inject(STORE_EDITOR)
@observer
export class Palettes extends React.Component<PalettesProps> {

  constructor(props: PalettesProps) {
    super(props)
  }

  render() {
    return (
      <>
        <div hidden={this.props.editor.mode !== EditorMode.BUILDER}>
          <BuilderPalettes/>
        </div>
        <div hidden={this.props.editor.mode !== EditorMode.SIMULATOR}>
          <SimulatorPalettes/>
        </div>
      </>
    )
  }
}


export default compose<PalettesProps, PalettesProps>(
)(Palettes)

