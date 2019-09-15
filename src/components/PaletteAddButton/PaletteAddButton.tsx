import * as React from "react";
import {default as IconButton, IconButtonProps} from "@material-ui/core/IconButton";
import AddBoxIcon from '@material-ui/icons/AddBox';
import {makeStyles, Theme} from "@material-ui/core";
import clsx from "clsx";


interface Props extends IconButtonProps {
  color?: Color
}

type Color = 'primary' | 'secondary'


const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    color: props => theme.palette[props.color][500],
    width: '24px',
    height: '24px',
    '&:hover': {
      color: '#00FF94'
    },
    '& span': {
      marginTop: '-11px'
    }
  }
}));

export const PaletteAddButton: React.FC<Props> = (props) => {
  const classes = useStyles(props)
  return (
    <IconButton {...props} className={clsx(classes.root, props.className)}>
      <AddBoxIcon/>
    </IconButton>
  )
}

PaletteAddButton.defaultProps = {
  color: "primary"
}

