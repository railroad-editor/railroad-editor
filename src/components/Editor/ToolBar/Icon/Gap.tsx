import * as React from 'react';
import SvgIcon from "material-ui/SvgIcon";

export default function Gap(props) {
  return (
    <SvgIcon {...props}>
      <rect x="7.5" y="3.1" width="3" height="17.8"/>
      <rect x="16.8" y="9.6" width="5.4" height="4.8"/>
      <rect x="13.8" y="3.1" width="3" height="17.8"/>
      <rect x="2.1" y="9.6" width="5.4" height="4.8"/>
    </SvgIcon>
  );
}
