import * as React from 'react'
import {compose} from "recompose";
import {
  StyledPowerPackPalette,
  StyledSwitcherPalette
} from "containers/Editor/Palettes/SimulatorPalettes/SimulatorPalettes.style";
import {inject, observer} from "mobx-react";
import {STORE_LAYOUT} from "constants/stores";
import {WithLayoutStore} from "stores";


export type SimulatorPalettesProps = {} & WithLayoutStore


@inject(STORE_LAYOUT)
@observer
export class SimulatorPalettes extends React.Component<SimulatorPalettesProps> {

  render() {
    return (
      <>
        <StyledPowerPackPalette
          // active={this.props.editor.EditorMode.SIMULATOR}
          active={true}
          items={this.props.layout.currentLayoutData.powerPacks}
          helpMessage={'Click + to add a power unit.'}
        />
        <StyledSwitcherPalette
          // active={this.props.editor.EditorMode.SIMULATOR}
          active={true}
          items={this.props.layout.currentLayoutData.switchers}
          helpMessage={'Click + to add a turnout switcher.'}
        />
      </>
    )
  }
}


export default compose<SimulatorPalettesProps, SimulatorPalettesProps>(
)(SimulatorPalettes)

