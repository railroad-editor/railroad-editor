import * as React from "react";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
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

  getInitialState = () => {
    return {
      inputs: {
        x: '0',
        y: '0',
      },
      disabled: true
    } as DistantPlacingDialogState
  }

  onOK = (e) => {
    let diff = new Point(Number(this.state.inputs.x), Number(this.state.inputs.y))
    let newPosition = this.props.builder.freePlacingPosition.add(diff)
    this.props.builder.setFreePlacingPosition(newPosition)
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
                validators={['matchRegexp:^-?[0-9]*\s*$']}
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
                validators={['matchRegexp:^-?[0-9]*\s*$']}
                errorMessages={['value must be a number']}
            />
          </ValidatorForm>
        </>
    )
  }
}
