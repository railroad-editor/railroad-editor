import * as React from 'react'
import AutoFocusTextValidator from "containers/common/AutoFocusTextValidator";
import {FormDialogBase, FormDialogProps, FormDialogState} from "containers/common/FormDialog/FormDialogBase";
import {ValidatorForm} from 'react-material-ui-form-validator';
import {inject, observer} from "mobx-react";
import {PaletteItem, WithUiStore} from "stores";
import {STORE_UI} from "constants/stores";


export type NewRailGroupDialogProps = {
  addUserRailGroup: (name: string) => void
  definedItems: PaletteItem[]
} & FormDialogProps & WithUiStore


@inject(STORE_UI)
@observer
export default class NewRailGroupDialog extends FormDialogBase<NewRailGroupDialogProps, FormDialogState> {

  constructor(props: NewRailGroupDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidMount() {
    ValidatorForm.addValidationRule('isUniqueName', (value) => {
      return ! this.props.definedItems.map(i => i.name).includes(value);
    });
    ValidatorForm.addValidationRule('isNameNotAllowed', (value) => {
      if (value) {
        return value.toUpperCase() !== 'CLIPBOARD'
      } else {
        return true
      }
    });
  }

  onOK = (e) => {
    this.props.addUserRailGroup(this.state.inputs.name)
    this.onClose()
  }

  renderContent = () => {
    return (
      <ValidatorForm
        ref={this.getFormRef}
      >
        <AutoFocusTextValidator
          label="Rail Group Name"
          name="name"
          key="name"
          value={this.state.inputs.name}
          onChange={this.onChange('name')}
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required', 'isUniqueName', 'isNameNotAllowed']}
          errorMessages={['this field is required', 'The name already exists.', 'The name cannot be used.']}
          withRequiredValidator={true}
        />
      </ValidatorForm>
    )
  }
}

