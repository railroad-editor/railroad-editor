import styled from "styled-components";
import {theme} from "../../../withRoot";
import IconButton from "material-ui/IconButton";
import Button from "material-ui/Button";
import Typography from "material-ui/Typography";


export const StyledIconButton = styled(IconButton as any)`
  &:hover {
    color: #FFFF00
  }
  &.active, &:active {
    color: #FFC700
  }
  &.disabled {
    color: ${theme.palette.primary['700'] 
  }
`

export const VerticalDivider = styled.div`
  border-left: solid ${theme.palette.primary['900']};
  width: 0px;
  height:40px;
  //padding: 0px 0px 0px 0px;
  margin: 0px 15px 0px 15px;
  //overflow: auto2
`

export const StyledLoginButton = styled(Button as any)`
  && {
    margin: 5px;
    padding: 8px 12px;
    width: 75px;
    height: 42px;
    font-size: 1.1rem;
  }
`

export const StyledSignUpButton = styled(Button as any)`
  && {
    margin: 5px;
    padding: 8px 12px;
    width: 80px;
    height: 42px;
    font-size: 1.0rem;
  }
`

export const LayoutTitle = styled(Typography)`
  && {
    margin-left: 10px;
    margin-right: 50px;
  }
`