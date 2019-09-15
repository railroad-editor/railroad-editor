import * as React from 'react'

import {Button, makeStyles, Theme} from '@material-ui/core';
import {ButtonProps} from "@material-ui/core/Button";
import clsx from "clsx";

interface Props extends ButtonProps {
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

export const ActiveButton: React.FC<Props> = (props) => {
  const classes = useStyles(props);
  return (
    <Button {...props} className={clsx(classes.root, props.className)}>
    </Button>
  )
};

ActiveButton.defaultProps = {
  active: false,
  color: 'primary'
};

