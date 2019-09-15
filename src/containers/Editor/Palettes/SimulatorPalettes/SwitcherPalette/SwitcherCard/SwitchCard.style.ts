import styled from "styled-components";
import {SecondaryColorActiveButton} from "containers/common/ActiveButton/index";
import {CardContent, CardHeader} from "@material-ui/core";


export const ActiveSmallButton = styled(SecondaryColorActiveButton as any)`
  && {
    min-width: 30px;
    display: block;   // for centerize to parent div
    margin: 0 auto;   // for centerize to parent div
    padding: 4px 8px;
  }
`

export const Spacer = styled.div`
  height: 20px;
`

export const NarrowCardContent = styled(CardContent)`
  && {
    padding: 8px 0px 8px 6px
  }
`

export const NarrowCardHeader = styled(CardHeader)`
  && {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`
