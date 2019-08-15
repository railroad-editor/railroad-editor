import * as React from "react";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState, FormInputs} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {inject, observer} from "mobx-react";
import {STORE_BUILDER} from "constants/stores";
import {BuilderStore} from "../../../../store/builderStore";
import {Point} from "paper";


export interface DistantPlacingDialogProps extends FormDialogProps {
  builder?: BuilderStore
}

export interface DistantPlacingDialogState extends FormDialogState {
}


@inject(STORE_BUILDER)
@observer
export default class DistantPlacingDialog extends FormDialog<DistantPlacingDialogProps, DistantPlacingDialogState> {

  constructor(props: DistantPlacingDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialInputs(): FormInputs {
    return {
      x: '0', y: '0'
    }
  }

  onOK = (e) => {
    let diff = new Point(Number(this.state.inputs.x), Number(this.state.inputs.y))
    this.props.builder.setFreePlacingDifference(diff)
    this.onClose()
  }

  renderContent = () => {
    return (
      <>
        <ValidatorForm
          ref={this.getFormRef}
        >
          <AutoFocusTextValidator
            label="X"
            name="x"
            key="x"
            value={this.state.inputs.x}
            onChange={this.onChange('x')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['required', 'matchRegexp:^-?[0-9]*\s*$']}
            errorMessages={['this field is required', 'value must be a number']}
            withRequiredValidator={true}
          />
          <TextValidator
            label="Y"
            name="y"
            key="y"
            value={this.state.inputs.y}
            onChange={this.onChange('y')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['required', 'matchRegexp:^-?[0-9]*\s*$']}
            errorMessages={['this field is required', 'value must be a number']}
            withRequiredValidator={true}
          />
        </ValidatorForm>
      </>
    )
  }
}
