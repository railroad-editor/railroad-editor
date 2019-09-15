import * as React from 'react';
import clsx from 'clsx';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import {amber, green} from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import MuiSnackbar, {SnackbarProps as MuiSnackbarProps} from '@material-ui/core/Snackbar';
import MuiSnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import {makeStyles, Theme} from '@material-ui/core/styles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    zIndex: 1500
  },
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  margin: {
    margin: theme.spacing(1),
    zIndex: 60000
  },
}));


interface SnackbarProps extends MuiSnackbarProps {
  variant: SnackbarVariant
}

type SnackbarVariant = 'success' | 'error' | 'info' | 'warning'


export const Snackbar: React.FC<SnackbarProps> = (props) => {
  const {variant, message, onClose, className, ...rest} = props
  const Icon = variantIcon[variant];
  const closeSnackbar = (e) => onClose(e, null);

  const classes = useStyles(props)

  return (
    <MuiSnackbar
      {...rest}
      className={clsx(classes.root, className)}
      onClose={onClose}
      autoHideDuration={5000}
    >
      <MuiSnackbarContent
        className={clsx(classes[variant], classes.margin, className)}
        aria-describedby="client-snackbar"
        message={
          <span id="client-snackbar" className={classes.message}>
          <Icon className={clsx(classes.icon, classes.iconVariant)}/>
            {message}
        </span>
        }
        action={[
          <IconButton key="close" aria-label="close" color="inherit" onClick={closeSnackbar}>
            <CloseIcon className={classes.icon}/>
          </IconButton>,
        ]}
      />
    </MuiSnackbar>
  )
}