import styled from "styled-components";
import {DialogContent} from "material-ui";
import Grid from "material-ui/Grid";


export const TitleDiv = styled.div`
  margin: 0;
  padding: 15px 15px 20px 15px;
  flex: 0 0 auto;
`

export const StyledDialogContent = styled(DialogContent as any)`
  width: 350px;
`


export const MainButtonGrid = styled(Grid as any)`
  && {
    margin: 16px 0px 16px 0px;
  }
`

export const ErrorMessageGrid = styled(Grid as any)`
  && {
    margin: 16px 0px 0px 0px;
    color: red;
  }
`

