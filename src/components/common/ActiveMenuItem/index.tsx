import * as React from 'react'

import {MenuItem} from '@material-ui/core';
import {ListItemProps} from "@material-ui/core/ListItem";
import styled from "styled-components";
import {theme} from "withRoot";

export interface ActiveMenuItemProps extends ListItemProps {
  className?: string
  active?: boolean
}

export default class ActiveMenuItem extends React.Component<ActiveMenuItemProps, {}> {

  render() {
    return (
      <MenuItem {...this.props}>
      </MenuItem>
    )
  }
}

export const PrimaryColorActiveMenuItem = styled(ActiveMenuItem)`
  && { 
    background-color: ${theme.palette.primary[500]};
    padding-right: 18px;
  }
`

export const SecondaryColorActiveMenuItem = styled(ActiveMenuItem)`
  && { 
    background-color: ${props => props.active ? theme.palette.secondary[400] : theme.palette.background.default};
    :hover {
      background-color: ${props => props.active ? theme.palette.secondary[500] : theme.palette.grey[200]};
    }
    padding-right: 18px;
  }
`
