import styled from "styled-components";
import Rnd from "react-rnd"
import LayerPalette from "containers/Editor/Palettes/BuilderPalettes/LayerPalette/LayerPalette";
import RailPalettes from "containers/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalettes";
import InfoPalette from "./InfoPalette/InfoPalette";


export const StyledRnd = styled(Rnd as any)`
  z-index: 50;
  // overwrite Rnd's inline style
  //width: 100%!important;
  //height: 100%!important;
`

export const StyledRailPalette = styled(RailPalettes as any)`
  // Rndのインラインスタイルである top:0, left:0 を打ち消す
  top: 15px!important;
  left: 15px!important;
  // AppBarよりも上に置く
  //z-index: 1100;
`

export const StyledLayerPalette = styled(LayerPalette as any)`
  // Rndのインラインスタイルである top:0, left:0 を打ち消す
  top: 15px!important;
  left: auto!important;
  right: 15px;
  // AppBarよりも上に置く
  //z-index: 1100;
`

export const StyledInfoPalette = styled(InfoPalette as any)`
  // Rndのインラインスタイルである top:0, left:0 を打ち消す
  top: ${window.innerHeight - 250}px!important;
  left: auto!important;
  right: 15px;

`
