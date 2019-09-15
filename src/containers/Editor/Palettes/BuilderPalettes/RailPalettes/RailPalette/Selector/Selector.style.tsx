import styled from "styled-components";
import ActiveListItem from "containers/common/ActiveListItem/index";
import {theme} from "withRoot";


export const StyledListItem = styled(ActiveListItem)`
  && {
    background-color: ${props => props.active ? theme.palette.secondary[400] : theme.palette.background.default};
    :hover {
      background-color: ${props => props.active ? theme.palette.secondary[500] : theme.palette.grey[200]};
    }
  }
`

