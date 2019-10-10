import * as React from "react";
import AutoFocusTextValidator from "containers/common/AutoFocusTextValidator";
import {
  FormDialogBase,
  FormDialogProps,
  FormDialogState,
  FormInputs
} from "containers/common/FormDialog/FormDialogBase";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {inject, observer} from "mobx-react";
import {BuilderStore} from "stores/builderStore";
import {Point} from "paper";
import {FreeRailPlacerStore} from "stores/freeRailPlacerStore";
import {STORE_BUILDER, STORE_FREE_RAIL_PLACER} from "constants/stores";


export interface DistantPlacingDialogProps extends FormDialogProps {
  builder?: BuilderStore
  freeRailPlacer?: FreeRailPlacerStore
}

export interface DistantPlacingDialogState extends FormDialogState {
}


@inject(STORE_BUILDER, STORE_FREE_RAIL_PLACER)
@observer
export default class DistantPlacingDialog extends FormDialogBase<DistantPlacingDialogProps, DistantPlacingDialogState> {

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
    this.props.freeRailPlacer.setFreePlacingDifference(diff)
    this.onClose()
  }

  /* eslint no-useless-escape: 0 */
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
