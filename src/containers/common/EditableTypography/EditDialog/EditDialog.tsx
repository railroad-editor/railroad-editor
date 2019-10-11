import * as React from 'react'
import AutoFocusTextValidator from "containers/common/AutoFocusTextValidator";
import {FormDialogBase, FormDialogProps, FormDialogState} from "containers/common/FormDialog/FormDialogBase";
import {ValidatorForm} from 'react-material-ui-form-validator';


export interface EditDialogProps extends FormDialogProps {
  title: string
  text: string
  onOK: (text: string) => void
}


export default class EditDialog extends FormDialogBase<EditDialogProps, FormDialogState> {

  constructor(props: EditDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      inputs: {
        text: this.props.text
      },
      disabled: true
    }
  }

  onOK = (e) => {
    this.props.onOK(this.state.inputs.text)
    this.onClose()
  }

  renderContent = () => {
    return (
      <ValidatorForm
        ref={this.getFormRef}
      >
        <AutoFocusTextValidator
          label={this.props.title}
          name="text"
          key="text"
          value={this.state.inputs.text}
          onChange={this.onChange('text')}
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required']}
          errorMessages={['this field is required']}
          withRequiredValidator={true}
        />
      </ValidatorForm>
    )
  }
}

