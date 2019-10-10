import * as React from 'react'

import {makeStyles, MenuItem, Theme} from '@material-ui/core';
import {ListItemProps} from "@material-ui/core/ListItem";
import clsx from "clsx";

interface Props extends ListItemProps {
  active?: boolean
  color?: Color
}

type Color = 'primary' | 'secondary'

const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    backgroundColor: props => props.active ? theme.palette[props.color][400] : theme.palette.background.default,
    '&:hover': {
      backgroundColor: props => props.active ? theme.palette[props.color][500] : theme.palette.grey[200],
    },
    paddingRight: '18px'
  }
}));

export const ActiveMenuItem: React.FC<Props> = (props) => {
  const classes = useStyles(props)
  return (
    // TODO: https://github.com/mui-org/material-ui/issues/14971
    <MenuItem {...props as any} className={clsx(classes.root, props.className)}/>
  )
}

