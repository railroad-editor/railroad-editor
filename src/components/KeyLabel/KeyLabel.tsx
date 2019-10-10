import * as React from "react";
import styled from "styled-components";

interface Props {
  text: string
}

const LabelDiv = styled.div`
  padding: 4px 8px;
  margin-left: 16px;
  font-size: 0.625rem;
  line-height: 1.4em;
  border-radius: 2px;
  color: #fff;
  background-color: #717171;
`


export const KeyLabel: React.FC<Props> = (props) => {
  return (
    <LabelDiv>
      {props.text}
    </LabelDiv>
  )
};

