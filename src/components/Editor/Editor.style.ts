import styled from "styled-components";
import {View} from "react-paper-bindings";
import Palette from "./Palette/Palette";
import ToolBar from "./ToolBar/ToolBar";
import LayerPalette from "./LayerPalette/LayerPalette";


export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 64px 0 0 0;    /* for ToolBar */
  width: 100%;
  height: 100%;
  background: #363636;
`

export const EditorBody = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`


export const StyledPalette = styled(Palette as any)`
  // Rndのインラインスタイルである top:0, left:0 を上書きする
  top: 10px!important;
  left: 10px!important;
  width: 200px;
`

export const StyledToolBar = styled(ToolBar as any)`
`


export const StretchedView = styled(View as any)`
  // Viewのインライン要素の width, height を上書きする
  width: 100%!important;
  height: 100%!important;
`

export const StyledLayerPalette = styled(LayerPalette as any)`
  // Rndのインラインスタイルである top:0, left:0 を打ち消す
  top: 10px!important;
  left: auto!important;
  right: 10px;
  //top: 10px!important;
  //left: 10px!important;
  //width: 200px!important;
`
