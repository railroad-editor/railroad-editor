import * as React from 'react'
import {compose} from "recompose";
import {
  StyledInfoPalette,
  StyledLayerPalette,
  StyledRailPalette
} from "containers/Editor/Palettes/BuilderPalettes/BuilderPalettes.style";


export interface BuilderPalettesProps {
}

export class BuilderPalettes extends React.Component<BuilderPalettesProps> {

  render() {
    return (
      <>
        <StyledRailPalette/>
        <StyledLayerPalette/>
        <StyledInfoPalette/>
      </>
    )
  }
}


export default compose<BuilderPalettesProps, BuilderPalettesProps>(
)(BuilderPalettes)

