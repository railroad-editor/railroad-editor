import * as React from 'react';
import SvgIcon from "material-ui/SvgIcon";

export default function TurnoutIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M17.4,19c-3.5-3.5-8.3-5.5-13.2-5.5v-3c5.7,0,11.3,2.3,15.4,6.3L17.4,19z"/>
      <path d="M4.2,13.5v-3c4.9,0,9.8-2,13.2-5.5l2.1,2.1C15.5,11.2,9.9,13.5,4.2,13.5z"/>
    </SvgIcon>
  );
}
