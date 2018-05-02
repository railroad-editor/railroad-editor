import * as React from "react";
import {FormControlLabel} from "material-ui";
import Checkbox from "material-ui/Checkbox";
import {Tools} from "constants/tools";
import {RailItemData} from "components/rails";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";

export interface CustomStraightRailDialogProps extends FormDialogProps {
  addUserRail: (item: RailItemData) => void
}

export interface CustomStraightRailDialogState extends FormDialogState {
  isDouble: boolean
}



export default class CustomStraightRailDialog extends FormDialog<CustomStraightRailDialogProps, CustomStraightRailDialogState> {

  static INITIAL_STATE = {
    name: '',
    length: '',
    errors: {
      name: false,
      length: false,
    },
    errorTexts: {
      name: '',
      length: '',
    },
    isDouble: false,
  }


  constructor(props: CustomStraightRailDialogProps) {
    super(props)
    this.state = this.getInitialState()

    this.onDoubleChange = this.onDoubleChange.bind(this)
  }

  getInitialState = () => {
    return {
      inputs: {},
      isDouble: false,
      disabled: true,
    }
  }

  onOK = (e) => {
    const {isDouble, inputs} = this.state
    let type = isDouble ? 'DoubleStraightRail' : 'StraightRail'
    this.props.addUserRail({
      type: type,
      length: Number(inputs.length),
      name: inputs.name,
      paletteName: Tools.STRAIGHT_RAILS,
    })

    this.props.onClose()
  }


  onDoubleChange = (e: React.SyntheticEvent<HTMLInputElement|any>) => {
    this.setState({
      isDouble: ! this.state.isDouble,
    });
  };

  renderValidators = () => {
    return (
        <ValidatorForm
          ref={(form) => this._form = form}
        >
          <AutoFocusTextValidator
            autoFocus
            label="Length"
            type="number"
            name="length"
            key="length"
            value={this.state.inputs.name}
            onChange={this.onChange('length')}
            validatorListener={this.handleValidation}
            validators={['required']}
            errorMessages={['this field is required']}
          />
          <br/>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.isDouble}
                onChange={this.onDoubleChange}
              />
            }
            label={"Double"}
          />
          <br/>
          <TextValidator
            label="Name"
            name="name"
            key="name"
            value={this.state.inputs.name}
            onChange={this.onChange('name')}
            validatorListener={this.handleValidation}
            validators={['required']}
            errorMessages={['this field is required']}
          />
        </ValidatorForm>
    )
  }
}
