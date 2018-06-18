import styled from "styled-components";
import {CardContent, CardHeader, List, ListItem} from '@material-ui/core';
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