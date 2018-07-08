import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {compose} from "recompose";
import {LayoutStore} from "store/layoutStore";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";
import {
  StyledPowerPackPalette,
  StyledSwitcherPalette
} from "components/Editor/Palettes/SimulatorPalettes/SimulatorPalettes.style";


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
      <div hidden={this.props.common.editorMode !== EditorMode.SIMULATOR}>
        <StyledPowerPackPalette
          // active={this.props.common.EditorMode.SIMULATOR}
          active={true}
          items={this.props.layout.currentLayoutData.powerPacks}
          helpMessage={'Click + to add a power unit.'}
        />
        <StyledSwitcherPalette
          // active={this.props.common.EditorMode.SIMULATOR}
          active={true}
          items={this.props.layout.currentLayoutData.switchers}
          helpMessage={'Click + to add a turnout switcher.'}
        />
      </div>
    )
  }
}


export default compose<PaletteProps, any>(
)(SimulatorPalettes)

