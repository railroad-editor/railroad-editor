import * as React from 'react'
import getLogger from "logging";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {ValidatorForm} from 'react-material-ui-form-validator';
import {inject, observer} from "mobx-react";
import {STORE_UI} from "../../../../../../../constants/stores";
import {UiStore} from "../../../../../../../store/uiStore";

const LOGGER = getLogger(__filename)

export interface NewRailGroupDialogProps extends FormDialogProps {
  addUserRailGroup: (name: string, shouldDelete: boolean) => void
  definedItems: PaletteItem[]
  ui?: UiStore
}


@inject(STORE_UI)
@observer
export default class NewRailGroupDialog extends FormDialog<NewRailGroupDialogProps, FormDialogState> {

  constructor(props: NewRailGroupDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  componentWillMount() {
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
    this.props.addUserRailGroup(this.state.inputs.name, false)
    this.onClose()
  }

  renderContent = () => {
    console.log(this.state.inputs)
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

