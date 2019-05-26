import * as React from 'react'
import {compose} from "recompose";
import {LayoutStore} from "store/layoutStore";
import {
  StyledPowerPackPalette,
  StyledSwitcherPalette
} from "components/Editor/Palettes/SimulatorPalettes/SimulatorPalettes.style";


export interface SimulatorPalettesProps {
  layout?: LayoutStore
}

export class SimulatorPalettes extends React.Component<SimulatorPalettesProps> {

  constructor(props: SimulatorPalettesProps) {
    super(props)
  }

  render() {
    return (
        <>
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
        </>
    )
  }
}


export default compose<SimulatorPalettesProps, SimulatorPalettesProps>(
)(SimulatorPalettes)

