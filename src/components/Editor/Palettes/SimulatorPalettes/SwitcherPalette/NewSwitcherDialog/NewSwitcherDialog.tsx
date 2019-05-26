import * as React from 'react'
import getLogger from "logging";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {ValidatorForm} from 'react-material-ui-form-validator';
import {compose} from "recompose";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {FormControl, InputLabel, MenuItem, Select} from "@material-ui/core";
import {SwitcherType} from "store/layoutStore";

const LOGGER = getLogger(__filename)

export interface NewSwitcherDialogProps extends FormDialogProps {
  addSwitcher:(name: string, type: SwitcherType) => void
  snackbar: any
}


export class NewSwitcherDialog extends FormDialog<NewSwitcherDialogProps, FormDialogState> {

  constructor(props: NewSwitcherDialogProps) {
    super(props)
    this.state = this.getInitialState()
    this.state.inputs.type = SwitcherType.NORMAL
  }

  onOK = (e) => {
    const {name, type} = this.state.inputs
    this.props.addSwitcher(name, type as any)
    // this.props.snackbar.showMessage(`Copied to "${this.state.inputs.name}" rail group.`)  //`
    this.onClose()
  }

  renderContent = () => {
    console.log(this.state.inputs)
    return (
      <>
        <ValidatorForm
          ref={(form) => this._form = form}
        >
          <AutoFocusTextValidator
            label="Switcher Name"
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
        <form>
          <FormControl style={{width: '100%'}}>
            <InputLabel>Switcher Type</InputLabel>
            <Select
              value={this.state.inputs.type}
              onChange={this.onChange('type')}
              autoWidth
              displayEmpty
            >
              <MenuItem value={SwitcherType.NORMAL}>
                {SwitcherType.NORMAL}
              </MenuItem>
              <MenuItem value={SwitcherType.THREE_WAY}>
                {SwitcherType.THREE_WAY}
              </MenuItem>
            </Select>
          </FormControl>
        </form>
      </>
    )
  }
}


export default compose<NewSwitcherDialogProps, NewSwitcherDialogProps|any>(
  withSnackbar()
)(NewSwitcherDialog)
