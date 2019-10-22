import styled from "styled-components";
import Paper from "@material-ui/core/Paper";
import Selector from "containers/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/Selector/Selector";

export const HideableDiv = styled.div`
  &.hidden {
    display: none;
  }
`

export const PaletteBodyPaper = styled(Paper)`
  && {
    width: 240px;
    max-width: 240px;
  }
`

export const ScrollablePaper = styled(Paper as any)`
  && {
    max-width: 240px;
    // 251.82 * 3 = 20 = 775.46
    max-height: 776px;
    overflow: scroll;
    ::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 7px;
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-color: rgba(0,0,0,.5);
        -webkit-box-shadow: 0 0 1px rgba(255,255,255,.5);
        opacity: 0.5;
    }
  }
`

export const StyledSelector = styled(Selector)`
  && {
    max-width: 200px;
  }
`

export const CenteredDiv = styled.div`
  margin: 15px;
`
