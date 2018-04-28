import * as React from "react";
import {default as IconButton, IconButtonProps} from "material-ui/IconButton";
import AddBoxIcon from 'material-ui-icons/AddBox';
import styled from "styled-components";

const StyledIconButton = styled(IconButton as any)`
  && {
    width: 24px;
    height: 24px;
    &:hover {
        color: yellow
      }
    &.active, &:active {
        color: orange;
    }
  }
`

const AddLayerButton: React.SFC<IconButtonProps> = (props) => {
  return (
    <StyledIconButton {...props}>
      <AddBoxIcon/>
    </StyledIconButton>
  )
}

export default AddLayerButton


