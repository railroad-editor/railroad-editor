import * as React from 'react'
import styled from "styled-components";
import ToolBar from "./ToolBar/ToolBar";
import {Tooltip} from "@material-ui/core";
import {TooltipProps} from "@material-ui/core/Tooltip";


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


export const StyledToolBar = styled(ToolBar as any)`
`


export const StyledTooltip = styled((props: TooltipProps) => <Tooltip {...props} classes={{
  tooltip: 'tooltip',
  popper: 'popper'
}}/>)`
  && {
    .popper {
      z-index: 18000;
    }
    .tooltip {
      background-color: red;
      z-index: 19000!important;
      overflow: visible;
    }
    z-index: 1100;
    overflow: visible;
  }
`