import styled from "styled-components";
import Rnd from "react-rnd"
import PowerPackPalette from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackPalette";
import SwitcherPalette from "containers/Editor/Palettes/SimulatorPalettes/SwitcherPalette/SwitcherPalette";


export const StyledRnd = styled(Rnd as any)`
  z-index: 50;
  // overwrite Rnd's inline style
  //width: 100%!important;
  //height: 100%!important;
`

export const StyledPowerPackPalette = styled(PowerPackPalette as any)`
  // Rndのインラインスタイルである top:0, left:0 を打ち消す
  top: 10px!important;
  left: 10px!important;
  // AppBarよりも上に置く
  //z-index: 1100;
`

export const StyledSwitcherPalette = styled(SwitcherPalette as any)`
  // Rndのインラインスタイルである top:0, left:0 を打ち消す
  top: 10px!important;
  left: auto!important;
  right: 10px;
  // AppBarよりも上に置く
  //z-index: 1100;
`
