import * as React from 'react'
import getLogger from "logging";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';

const LOGGER = getLogger(__filename)

export interface NewRailGroupDialogProps extends FormDialogProps {
  onOK: (name: string) => void
}


export default class NewRailGroupDialog extends FormDialog<NewRailGroupDialogProps, FormDialogState> {

  constructor(props: NewRailGroupDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  onOK = (e) => {
    this.props.onOK(this.state.inputs.name)
    this.props.onClose()
  }

  renderValidators = () => {
    return (
      <ValidatorForm
        ref={(form) => this._form = form}
      >
        <AutoFocusTextValidator
          label="Rail Group Name"
          name="name"
          key="name"
          value={this.state.inputs.name}
          onChange={this.onChange('name')}
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required']}
          errorMessages={['this field is required']}
        />
      </ValidatorForm>
    )
  }

}
