import * as React from 'react'
import getLogger from "logging";
import AutoFocusTextValidator from "containers/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "containers/common/FormDialog/FormDialog";
import {ValidatorForm} from 'react-material-ui-form-validator';

const LOGGER = getLogger(__filename)

export interface NewPowerPackDialogProps extends FormDialogProps {
  addPowerPack: (name: string) => void
}


export default class NewPowerPackDialog extends FormDialog<NewPowerPackDialogProps, FormDialogState> {

  constructor(props: NewPowerPackDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  onOK = (e) => {
    this.props.addPowerPack(this.state.inputs.name)
    this.onClose()
  }

  renderContent = () => {
    console.log(this.state.inputs)
    return (
      <ValidatorForm
        ref={this.getFormRef}
      >
        <AutoFocusTextValidator
          label="Power Pack Name"
          name="name"
          key="name"
          value={this.state.inputs.name}
          onChange={this.onChange('name')}
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

