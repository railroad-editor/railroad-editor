import * as React from 'react';
import SvgIcon from "material-ui/SvgIcon";

export default function RailGroupIcon(props) {
  return (
    <SvgIcon {...props}>
      <rect x="2.4" y="15.5" width="19.1" height="3"/>
      <path d="M6.5,17.4l-2.9-0.8l2.3-9c0.3-1.2,1.4-1.9,2.6-1.9h3.3v3h-3L6.5,17.4z"/>
      <path d="M17,17.4l-2.3-8.7h-3v-3h3.3c1.2,0,2.2,0.8,2.5,1.9l2.4,9L17,17.4z"/>
    </SvgIcon>
  );
}
