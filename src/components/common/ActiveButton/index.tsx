import * as React from 'react'

import {Button} from '@material-ui/core';
import {ButtonProps} from "@material-ui/core/Button";
import styled from "styled-components";
import {theme} from "withRoot";

export interface ActiveButtonProps extends ButtonProps {
  className?: string
  active?: boolean
}

export default class ActiveButton extends React.Component<ActiveButtonProps, {}> {

  render() {
    return (
      <Button {...this.props}>
      </Button>
    )
  }
}

export const PrimaryColorActiveButton = styled(ActiveButton)`
  && { 
    background-color: ${props => props.active ? theme.palette.primary[400] : theme.palette.background.default};
    :hover {
      background-color: ${props => props.active ? theme.palette.primary[500] : theme.palette.grey[200]};
    }
    padding-right: 18px;
  }
`

export const SecondaryColorActiveButton = styled(ActiveButton)`
  && { 
    background-color: ${props => props.active ? theme.palette.secondary[400] : theme.palette.background.default};
    :hover {
      background-color: ${props => props.active ? theme.palette.secondary[500] : theme.palette.grey[200]};
    }
    padding-right: 18px;
  }
`
