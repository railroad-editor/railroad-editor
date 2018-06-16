import styled from "styled-components";
import Button from "@material-ui/core/Button";
import ActiveButton, {SecondaryColorActiveButton} from "components/common/ActiveButton";
import {CardContent} from "@material-ui/core";


export const ActiveSmallButton = styled(SecondaryColorActiveButton as any)`
  && {
    min-width: 30px;
    display: block;   // for centerize to parent div
    margin: 0 auto;   // for centerize to parent div
  }
`

export const Spacer = styled.div`
  height: 20px;
`

export const NarrowCardContent = styled(CardContent as any)`
  && {
    padding-left: 6px;
    padding-right: 6px;
  }
`
