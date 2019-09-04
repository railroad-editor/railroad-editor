import styled from "styled-components";
import Grid from "@material-ui/core/Grid";

export const CenteredGrid = styled(Grid as any)`
  && {
    max-width: 420px;
    display: block;   // for centerize to parent div
    margin: 0 auto;   // for centerize to parent div
  }
`
