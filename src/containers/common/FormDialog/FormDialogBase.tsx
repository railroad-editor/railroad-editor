import * as React from 'react'
import {DialogActions, DialogContent, DialogTitle} from '@material-ui/core'
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import getLogger from "logging";
import {ValidatorForm} from 'react-material-ui-form-validator';

const LOGGER = getLogger(__filename)

export interface FormDialogProps {
  open: boolean
  onClose: () => void
  title: string
  defaultInputs?: FormInputs
  classes?: any
  disableEsc?: boolean
}

export interface FormDialogState {
  inputs: {
    [key: string]: string
  }
  disabled: boolean
}

export interface FormInputs {
  [key: string]: string
}


/**
 *  ユーザーの入力を要求する Form Dialog のベースクラス。
 */
export abstract class FormDialogBase<P extends FormDialogProps, S extends FormDialogState> extends React.Component<P, S> {

  protected _form: ValidatorForm = null

  protected constructor(props: P) {
    super(props)
  }

  /**
   * override me
   */
  getInitialInputs(): FormInputs {
    return {}
  }

  /**
   * override and call me
   */
  getInitialState(): FormDialogState {
    return {
      inputs: {
        ...this.getInitialInputs(),
        ...this.props.defaultInputs
      },
      disabled: false
    }
  }

  abstract onOK: (e: any) => void

  abstract renderContent: () => React.ReactNode

  /**
   * use me to get ref of ValidationForm
   */
  getFormRef = (ref) => {
    if (ref && ! this._form) {
      this._form = ref
    }
  }

  onOKWrapper = (e) => {
    this.onOK(e)
    this.onClose()
  }

  onEnter = () => {
    this.setState(this.getInitialState())
    this.handleValidation()
  }

  onClose = () => {
    this.props.onClose()
    setTimeout(() => this.setState(this.getInitialState()), 500)
  }

  onChange = name => e => {
    this.setInput(name, e.target.value)
  }

  handleValidation = async () => {
    let disabled = true
    if (this._form) {
      disabled = ! await this._form.isFormValid()
    }
    this.setState({
      disabled: disabled
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
    if ((! this.state.disabled) && e.key === 'Enter') {
      this.onOK(e)
      e.preventDefault()
    }
  }

  render() {
    const {open, title, classes, disableEsc} = this.props
    return (
      <Dialog
        open={open}
        onEnter={this.onEnter}
        onClose={this.onClose}
        maxWidth="md"
        classes={classes}
        disableEscapeKeyDown={disableEsc}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {this.renderContent()}
        </DialogContent>
        <DialogActions>
          <Button color="primary" disabled={this.state.disabled} onClick={this.onOKWrapper}>
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
