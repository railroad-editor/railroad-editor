import * as React from 'react'

import {ListItem, makeStyles, Theme} from '@material-ui/core';
import {ListItemProps} from "@material-ui/core/ListItem";
import clsx from "clsx";

interface Props extends ListItemProps {
  active?: boolean
  color?: Color
}

type Color = 'primary' | 'secondary'

export type ActiveListItemProps = Props

const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    backgroundColor: props => props.active ? theme.palette[props.color][400] : theme.palette.background.default,
    '&:hover': {
      backgroundColor: props => props.active ? theme.palette[props.color][500] : theme.palette.grey[200],
    },
    paddingRight: '18px'
  }
}));

export const ActiveListItem: React.FC<Props> = (props) => {
  const classes = useStyles(props)
  return (
    // TODO: https://github.com/mui-org/material-ui/issues/14971
    <ListItem {...props as any} className={clsx(classes.root, props.className)}/>
  )
}

// export const PrimaryColorActiveListItem = styled(ActiveListItem)`
//   && {
//     background-color: ${props => props.active ? theme.palette.primary[400] : theme.palette.background.default}!important;
//     &:hover {
//       background-color: ${props => props.active ? theme.palette.primary[500] : theme.palette.grey[200]}!important;
//     }
//     padding-right: 18px;
//   }
// `
//
// export const SecondaryColorActiveListItem = styled(ActiveListItem)`
//   && {
//     background-color: ${props => props.active ? theme.palette.secondary[400] : theme.palette.background.default}!important;
//     &:hover {
//       background-color: ${props => props.active ? theme.palette.secondary[500] : theme.palette.grey[200]}!important;
//     }
//     padding-right: 18px;
//   }
// `
