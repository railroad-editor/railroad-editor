import * as React from 'react'
import {DialogActions, DialogContent, DialogTitle} from "material-ui"
import Dialog from "material-ui/Dialog";
import Button from "material-ui/Button";
import getLogger from "logging";
import AutoFocusTextField from "components/common/AutoFocusTextField";

const LOGGER = getLogger(__filename)

export interface NewRailGroupDialogProps {
  title: string
  okButtonTitle: string
  open: boolean
  onClose: () => void
  onOK: (name: string) => void
}

export interface NewRailGroupDialogState {
  name: string
  isError: boolean
  errorText: string
}


export default class NewRailGroupDialog extends React.Component<NewRailGroupDialogProps, NewRailGroupDialogState> {

  constructor(props: NewRailGroupDialogProps) {
    super(props)
    this.state = {
      name: '',
      isError: false,
      errorText: ' '
    }

    this.onOK = this.onOK.bind(this)
    this.onTextChange = this.onTextChange.bind(this)
  }

  onEnter = (e) => {
    this.setState({
      name: ''
    })
  }

  onOK = (e) => {
    this.props.onOK(this.state.name)
    this.props.onClose()
  }

  onTextChange(e: React.SyntheticEvent<any>) {
    const text = e.currentTarget.value
    if (text && text.match(/.{1,}/)) {
      this.setState({
        name: text,
        isError: false,
        errorText: ' '
      })
    } else {
      this.setState({
        name: text,
        isError: true,
        errorText: 'Must be over 1 characters'
      })
    }
  }


  render() {
    const { open, onClose, title, okButtonTitle } = this.props

    return (
      <Dialog
        open={open}
        onEnter={this.onEnter}
        onClose={onClose}
      >
        <DialogTitle id={title}>{title}</DialogTitle>
        <DialogContent>
          <AutoFocusTextField
            error={this.state.isError}
            autoFocus
            margin="normal"
            id="rail-group-name"
            label="Rail Group Name"
            helperText={this.state.errorText}
            onChange={this.onTextChange}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={this.state.isError || ! this.state.name} variant="raised" onClick={this.onOK} color="primary">
            {okButtonTitle}
          </Button>
          <Button onClick={onClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
