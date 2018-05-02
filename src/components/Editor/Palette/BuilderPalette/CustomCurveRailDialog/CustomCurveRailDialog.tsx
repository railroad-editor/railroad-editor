import * as React from "react";
import Dialog from "material-ui/Dialog";
import {DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup} from "material-ui";
import Button from "material-ui/Button";
import Checkbox from "material-ui/Checkbox";
import {Tools} from "constants/tools";
import TextField from "material-ui/TextField";
import AutoFocusTextField from "components/common/AutoFocusTextValidator";
import RailPartBase from "components/rails/parts/RailPartBase";
import {RailItemData} from "components/rails";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";

export interface CustomCurveRailDialogProps extends FormDialogProps {
  addUserRail: (item: RailItemData) => void
}

export interface CustomCurveRailDialogState extends FormDialogState {
  isDouble: boolean
}


export default class CustomCurveRailDialog extends FormDialog<CustomCurveRailDialogProps, CustomCurveRailDialogState> {

  static INITIAL_STATE = {
    name: '',
    radius: '',
    centerAngle: '',
    innerRadius: '',
    outerRadius: '',
    errors: {
      name: false,
      radius: false,
      centerAngle: false,
    },
    errorTexts: {
      name: '',
      radius: '',
      centerAngle: '',
    },
    isDouble: false,
  }

  constructor(props: CustomCurveRailDialogProps) {
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
    const {radius, innerRadius, outerRadius, centerAngle, name} = this.state.inputs
    if (this.state.isDouble) {
      this.props.addUserRail({
        type: 'DoubleCurveRail',
        innerRadius: parseInt(innerRadius),   // string -> number への変換を忘れないように
        outerRadius: parseInt(outerRadius),
        centerAngle: parseInt(centerAngle),
        name: name,
        paletteName: Tools.CURVE_RAILS,
      })
    } else {
      this.props.addUserRail({
        type: 'CurveRail',
        radius: parseInt(radius),
        centerAngle: parseInt(centerAngle),
        name: name,
        paletteName: Tools.CURVE_RAILS,
      })
    }

    this.props.onClose()
  }


  onDoubleChange = (e: React.SyntheticEvent<HTMLInputElement|any>) => {
    this.setState({
      isDouble: ! this.state.isDouble,
    });
  };


  /**
   * OuterRadiusをInnerRadiusの値でオートコンプリートする
   */
  onInnterRadiusBlur = () => {
    const {innerRadius, outerRadius} = this.state.inputs
    if (innerRadius && ! outerRadius) {
      this.setInput('outerRadius', String(Number(innerRadius) + RailPartBase.RAIL_SPACE))
    }
  }

  /**
   * InnerRadiusをOuterRadiusの値でオートコンプリートする
   */
  onOuterRadiusBlur = () => {
    const {innerRadius, outerRadius} = this.state.inputs
    if (outerRadius && ! innerRadius) {
      this.setInput('innerRadius', String(Number(outerRadius) - RailPartBase.RAIL_SPACE))
    }
  }

  renderValidators = () => {
    // const { innerRadius, outerRadius, radius, centerAngle, name } = this.state.inputs
    return (
      <ValidatorForm
        ref={(form) => this._form = form}
      >
        {this.state.isDouble &&
          <React.Fragment>
            <AutoFocusTextValidator
              label="Inner Radius"
              type="number"
              name="innerRadius"
              key="innerRadius"
              value={this.state.inputs.innerRadius}
              onChange={this.onChange('innerRadius')}
              onBlur={this.onInnterRadiusBlur}
            />
            <br />
            <TextValidator
              label="Outer Radius"
              type="number"
              name="outerRadius"
              key="outerRadius"
              value={this.state.inputs.outerRadius}
              onChange={this.onChange('outerRadius')}
              onBlur={this.onOuterRadiusBlur}
            />
          </React.Fragment>
        }
        {! this.state.isDouble &&
          <AutoFocusTextValidator
            label="Radius"
            type="number"
            name="radius"
            key="radius"
            value={this.state.inputs.radius}
            onChange={this.onChange('radius')}
          />
        }
        <br />
        <TextValidator
          label="Center Angle"
          type="number"
          name="centerAngle"
          key="centerAngle"
          value={this.state.inputs.centerAngle}
          onChange={this.onChange('centerAngle')}
        />
        <br />
        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.isDouble}
              onChange={this.onDoubleChange}
            />
          }
          label={"Double"}
        />
        <br />
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
