import * as React from 'react'
import {DialogActions, DialogContent, DialogTitle} from "material-ui"
import Dialog from "material-ui/Dialog";
import Button from "material-ui/Button";
import getLogger from "logging";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';

const LOGGER = getLogger(__filename)

export interface FormDialogProps {
  open: boolean
  onClose: () => void
  title: string
  defaultInputs?: Inputs
}

export interface FormDialogState {
  inputs: Inputs
  disabled: boolean
}

export interface Inputs {
  [key: string]: string
}


export abstract class FormDialog<P extends FormDialogProps, S extends FormDialogState> extends React.Component<P, S> {

  _form: ValidatorForm = null

  protected constructor(props: P) {
    super(props)
  }

  getInitialState = () => {
    return {
      inputs: this.props.defaultInputs || {},
      disabled: true
    }
  }

  abstract onOK: (e: any) => void

  abstract renderContent: () => React.ReactNode

  onEnter = () => {
    this.setState(this.getInitialState())
    this.handleValidation()
  }

  onClose = () => {
    this.setState(this.getInitialState())
    this.props.onClose()
  }

  onChange = name => e => {
    this.setInput(name, e.target.value)
  }

  handleValidation = () => {
    this.setState({
      disabled: ! (this._form && this._form.isFormValid())
    })
  }

  setInput = (name, value) => {
    this.setState({
      inputs: {
        ...this.state.inputs as any,
        [name]: value
      }
    })
  }

  onKeyPress = (e) => {
    if ( (! this.state.disabled) && e.key === 'Enter') {
      this.onOK(e)
      e.preventDefault()
    }
  }

  render() {
    const {open, title} = this.props
    return (
      <Dialog
        open={open}
        onEnter={this.onEnter}
        onClose={this.onClose}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            {this.renderContent()}
        </DialogContent>
        <DialogActions>
          <Button variant="raised" color="primary"
                  disabled={this.state.disabled} onClick={this.onOK}>
            OK
          </Button>
          <Button onClick={this.onClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
