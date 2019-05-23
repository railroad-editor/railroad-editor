import * as React from 'react'
import {compose} from "recompose";
import {StyledLayerPalette, StyledRailPalette} from "components/Editor/Palettes/BuilderPalettes/BuilderPalettes.style";


export interface BuilderPalettesProps {
}

export class BuilderPalettes extends React.Component<BuilderPalettesProps> {

  constructor(props: BuilderPalettesProps) {
    super(props)
  }

  render() {
    return (
      <>
        <StyledRailPalette />
        <StyledLayerPalette />
      </>
    )
  }
}


export default compose<BuilderPalettesProps, BuilderPalettesProps>(
)(BuilderPalettes)

