import * as React from 'react'
import {compose} from "recompose";
import {LayoutStore} from "store/layoutStore";
import {
  StyledPowerPackPalette,
  StyledSwitcherPalette
} from "containers/Editor/Palettes/SimulatorPalettes/SimulatorPalettes.style";
import {inject, observer} from "mobx-react";
import {STORE_LAYOUT} from "../../../../store";


export interface SimulatorPalettesProps {
  layout?: LayoutStore
}


@inject(STORE_LAYOUT)
@observer
export class SimulatorPalettes extends React.Component<SimulatorPalettesProps> {

  constructor(props: SimulatorPalettesProps) {
    super(props)
  }

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

