import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_COMMON} from "constants/stores";
import {compose} from "recompose";
import {EditorMode} from "store/uiStore";
import {CommonStore} from "store/commonStore";
import BuilderPalettes from "./BuilderPalettes/BuilderPalettes";


export interface PalettesProps {
  common?: CommonStore
}

@inject(STORE_COMMON)
@observer
export class Palettes extends React.Component<PalettesProps> {

  constructor(props: PalettesProps) {
    super(props)
  }

  render() {
    return (
      <>
        <div hidden={this.props.common.editorMode !== EditorMode.BUILDER}>
          <BuilderPalettes/>
        </div>
        <div hidden={this.props.common.editorMode !== EditorMode.SIMULATOR}>
          {/*<SimulatorPalettes/>*/}
        </div>
      </>
    )
  }
}


export default compose<PalettesProps, PalettesProps>(
)(Palettes)

