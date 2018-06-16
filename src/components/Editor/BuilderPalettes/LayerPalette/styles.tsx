import styled from "styled-components";
import Paper from "@material-ui/core/Paper";


export const TitleDiv = styled.div`
  display: flex;
  margin: 0;
  padding: 6px;
  font-size: 16px;
  line-height: 24px;
  text-align: left;
  border-bottom: 1px solid #eee;
  border-bottom: 1px solid #292929;
  cursor: move
`


export const ScrollablePaper = styled(Paper as any)`
  && {
    min-width: 200px;
    overflow: auto;
  }
`
