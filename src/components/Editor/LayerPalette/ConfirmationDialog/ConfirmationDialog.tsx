import * as React from "react";
import Dialog from "@material-ui/core/Dialog";
import {DialogActions, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import Button from "@material-ui/core/Button";

export interface RenameLayerDialogProps {
  title: string
  text: string
  open: boolean
  onOK: () => void
  onClose: () => void
}


export class ConfirmationDialog extends React.Component<RenameLayerDialogProps, {}> {

  constructor(props: RenameLayerDialogProps) {
    super(props)

    this.onOK = this.onOK.bind(this)
  }

  onOK = (e) => {
    this.props.onOK()
    this.props.onClose()
  }


  render() {
    const { open, onClose, title } = this.props

    return (
      <Dialog
        open={open}
        onClose={onClose}
      >
        <DialogTitle id={title}>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {this.props.text.split("\n").map(i => {
              return <div key={`d-${i}`}>{i}</div>;
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="raised" onClick={this.onOK} color="primary">
            OK
          </Button>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
