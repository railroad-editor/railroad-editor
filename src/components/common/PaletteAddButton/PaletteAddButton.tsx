import * as React from "react";
import {default as IconButton, IconButtonProps} from "@material-ui/core/IconButton";
import AddBoxIcon from '@material-ui/icons/AddBox';
import styled from "styled-components";
import {theme} from "withRoot";


export interface PaletteAddButtonProps extends IconButtonProps {
  className?: string
}

export class PaletteAddButton extends React.Component<PaletteAddButtonProps, {}> {
  render() {
    return (
      <IconButton {...this.props}>
        <AddBoxIcon/>
      </IconButton>
    )
  }
}

export const PrimaryPaletteAddButton = styled(PaletteAddButton)`
  && {
    color: ${theme.palette.primary[500]}
    width: 24px;
    height: 24px;
    &:hover {
        color: #00FF94
      }
    &.active, &:active {
        color: #FFC700
    }
    margin-top: -11px;
    margin-left: 10px;
  }
`

export const SecondaryPaletteAddButton = styled(PaletteAddButton)`
  && {
    color: ${theme.palette.secondary[500]}
    width: 24px;
    height: 24px;
    &:hover {
        color: #9DFF00
      }
    &.active, &:active {
        color: #FF9400
    }
    margin-top: -11px;
    margin-left: 10px;
  }
`


