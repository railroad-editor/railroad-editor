import * as React from "react";
import {default as IconButton, IconButtonProps} from "@material-ui/core/IconButton";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import {makeStyles, Theme} from "@material-ui/core";
import clsx from "clsx";


interface Props extends IconButtonProps {
}

const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    width: '24px',
    height: '24px',
    '& span': {
      marginTop: '-11px'
    }
  }
}));

export const PaletteListItemSettingButton: React.FC<Props> = (props) => {
  const classes = useStyles(props)
  return (
    <IconButton {...props} className={clsx(classes.root, props.className)}>
      <MoreVertIcon/>
    </IconButton>
  )

}

