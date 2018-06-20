import styled from "styled-components";
import {Tooltip} from "@material-ui/core";


export const StyledTooltip = (color) => styled(Tooltip)`
  && {
    :hover {
      cursor: move
    }
    .tooltip {
      background-color: ${color};
      z-index: 500;
    }
    background-color: ${color};
    z-index: 500;
  }
`
