import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {compose} from "recompose";
import {LayoutStore} from "store/layoutStore";
import {withSnackbar} from 'material-ui-snackbar-provider'
import PowerPackPalette from './PowerPackPalette/PowerPackPalette';
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";


export interface PaletteProps {
  common?: CommonStore
  layout?: LayoutStore
}

export interface PaletteState {
}


@inject(STORE_COMMON, STORE_LAYOUT)
@observer
export class SimulatorPalettes extends React.Component<PaletteProps, PaletteState> {

  constructor(props: PaletteProps) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <>
        {
          this.props.common.editorMode === EditorMode.SIMULATOR &&
          <>
            <PowerPackPalette
              // active={this.props.common.EditorMode.SIMULATOR}
              active={true}
              items={this.props.layout.currentLayoutData.powerPacks}
              helpMessage={'Click + to add a power unit.'}
            />
          </>
        }
      </>
    )
  }
}


export default compose<PaletteProps, any>(
)(SimulatorPalettes)

