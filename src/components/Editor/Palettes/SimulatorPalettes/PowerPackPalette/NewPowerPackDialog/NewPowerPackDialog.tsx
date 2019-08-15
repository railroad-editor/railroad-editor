import * as React from 'react'
import getLogger from "logging";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {ValidatorForm} from 'react-material-ui-form-validator';
import {compose} from "recompose";
import {withSnackbar} from 'material-ui-snackbar-provider'

const LOGGER = getLogger(__filename)

export interface NewPowerPackDialogProps extends FormDialogProps {
  addPowerPack: (name: string) => void
  snackbar: any
}


export class NewPowerPackDialog extends FormDialog<NewPowerPackDialogProps, FormDialogState> {

  constructor(props: NewPowerPackDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  onOK = (e) => {
    this.props.addPowerPack(this.state.inputs.name)
    // this.props.snackbar.showMessage(`Copied to "${this.state.inputs.name}" rail group.`)  //`
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


export default compose<NewPowerPackDialogProps, NewPowerPackDialogProps | any>(
  withSnackbar()
)(NewPowerPackDialog)
