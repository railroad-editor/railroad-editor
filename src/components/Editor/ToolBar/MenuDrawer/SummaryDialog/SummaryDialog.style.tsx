import styled from "styled-components";
import Paper from "@material-ui/core/Paper";
import {Grid} from "@material-ui/core";


export const ScrollablePaper = styled(Paper as any)`
  && {
    min-width: 200px;
    overflow: auto;
  }
`

export const ContentDiv = styled.div`
  padding: 5px
`

export const OddGrid = styled(Grid)`
`

export const EvenGrid = styled(Grid)`
  background-color: #eeeeee;
`

export const GridContainer = styled(Grid)`
  min-width: 200px;
  max-width: 200px;
`

export const Spacer = styled.div`
  height: 20px;
`
