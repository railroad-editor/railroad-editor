import * as React from "react";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {inject, observer} from "mobx-react";
import {STORE_BUILDER} from "constants/stores";


export interface FreePlacingDialogProps extends FormDialogProps {
}

export interface FreePlacingDialogState extends FormDialogState {
}



@inject(STORE_BUILDER)
@observer
export default class FreePlacingDialog extends FormDialog<FreePlacingDialogProps, FreePlacingDialogState> {

  constructor(props: FreePlacingDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }


  getInitialState = () => {
    return {
      inputs: {
        x: '0',
        y: '0',
      },
      disabled: true
    } as FreePlacingDialogState
  }

  onOK = (e) => {
    this.onClose()
  }

  renderContent = () => {
    return (
        <>
          <ValidatorForm
              ref={(form) => this._form = form}
          >
            <AutoFocusTextValidator
                label="X"
                name="x"
                key="x"
                value={this.state.inputs.x}
                onChange={this.onChange('x')}
                onKeyPress={this.onKeyPress}
                validatorListener={this.handleValidation}
                validators={['matchRegexp:^[0-9]*\s*$']}
                errorMessages={['value must be a number']}
            />
            <TextValidator
                label="Y"
                name="y"
                key="y"
                value={this.state.inputs.y}
                onChange={this.onChange('y')}
                onKeyPress={this.onKeyPress}
                validatorListener={this.handleValidation}
                validators={['matchRegexp:^[0-9]*\s*$']}
                errorMessages={['value must be a number']}
            />
          </ValidatorForm>
        </>
    )
  }
}
