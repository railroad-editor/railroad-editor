import * as React from "react";
import {default as IconButton, IconButtonProps} from "@material-ui/core/IconButton";
import styled from "styled-components";
import MoreVertIcon from '@material-ui/icons/MoreVert';


export interface PaletteListItemSettingButtonProps extends IconButtonProps {
  className?: string
}

export class PaletteListItemSettingButton extends React.Component<PaletteListItemSettingButtonProps, {}> {
  render() {
    return (
      <IconButton {...this.props}>
        <MoreVertIcon/>
      </IconButton>
    )
  }
}

export const PrimaryPaletteListItemSettingButton = styled(PaletteListItemSettingButton)`
  && {
    width: 24px;
    height: 24px;
    & span {
      margin-top: -11px;
    }
  }
`

