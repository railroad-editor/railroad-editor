import styled from "styled-components";
import {Button, CardContent, CardHeader, List} from '@material-ui/core';
import Slider from '@material-ui/lab/Slider';


export const StyledCardContent = styled(CardContent as any)`
  && {
    //height: 150px;
  }
`

export const NarrowCardContent = styled(CardContent)`
  && {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`

export const NarrowCardHeader = styled(CardHeader)`
  && {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`

export const StyledSlider = styled(Slider)`
  && {
    padding-right: 8px;
    padding-left: 8px;
  }
`

export const StyledList = styled(List)`
  && {
    margin-right: -16px;
    margin-left: -16px;
  }
`

export const Triangle = styled.div`
  position: absolute;
  width: 0;
  height: 0;
  border: 20px solid transparent;
  border-top: 20px solid ${props => props.color};
  border-left: 20px solid ${props => props.color};
`

export const SmallButton = styled(Button)`
  && {
    min-width: 50px;
    //width: 50px;
    display: block;   // for centerize to parent div
    margin: 0 auto;   // for centerize to parent div
  }
`

