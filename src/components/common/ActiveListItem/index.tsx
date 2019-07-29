import * as React from 'react'

import {ListItem} from '@material-ui/core';
import {ListItemProps} from "@material-ui/core/ListItem";
import styled from "styled-components";
import {theme} from "withRoot";

export interface ActiveListItemProps extends ListItemProps {
  className?: string
  active?: boolean
}

export default class ActiveListItem extends React.Component<ActiveListItemProps, {}> {

  render() {
    return (
      // TODO: https://github.com/mui-org/material-ui/issues/14971
      <ListItem {...this.props as any}>
      </ListItem>
    )
  }
}

export const PrimaryColorActiveListItem = styled(ActiveListItem)`
  && { 
    background-color: ${props => props.active ? theme.palette.primary[400] : theme.palette.background.default}!important;
    &:hover {
      background-color: ${props => props.active ? theme.palette.primary[500] : theme.palette.grey[200]}!important;
    }
    padding-right: 18px;
  }
`

export const SecondaryColorActiveListItem = styled(ActiveListItem)`
  && { 
    background-color: ${props => props.active ? theme.palette.secondary[400] : theme.palette.background.default}!important;
    &:hover {
      background-color: ${props => props.active ? theme.palette.secondary[500] : theme.palette.grey[200]}!important;
    }
    padding-right: 18px;
  }
`
