import * as React from 'react'
import getLogger from "logging";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {ValidatorForm} from 'react-material-ui-form-validator';

const LOGGER = getLogger(__filename)

export interface EditDialogProps extends FormDialogProps {
  title: string
  text: string
  onOK: (text: string) => void
}


export default class EditDialog extends FormDialog<EditDialogProps, FormDialogState> {

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
    console.log(this.state.inputs)
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

