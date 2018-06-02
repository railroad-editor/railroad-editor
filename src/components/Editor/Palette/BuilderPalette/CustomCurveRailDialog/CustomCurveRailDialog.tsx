import * as React from "react";
import {FormControlLabel} from "material-ui";
import Checkbox from "material-ui/Checkbox";
import {Tools} from "constants/tools";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {RailItemData} from "components/rails";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {RAIL_SPACE} from "constants/parts";

export interface CustomCurveRailDialogProps extends FormDialogProps {
  addUserRail: (item: RailItemData) => void
  definedItems: PaletteItem[]
}

export interface CustomCurveRailDialogState extends FormDialogState {
  isDouble: boolean
}


export default class CustomCurveRailDialog extends FormDialog<CustomCurveRailDialogProps, CustomCurveRailDialogState> {

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

  componentWillMount() {
    ValidatorForm.addValidationRule('isUniqueName', (value) => {
      return ! this.props.definedItems.map(i => i.name).includes(value);
    });
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

    this.onClose()
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
      this.setInput('outerRadius', String(Number(innerRadius) + RAIL_SPACE))
    }
  }

  /**
   * InnerRadiusをOuterRadiusの値でオートコンプリートする
   */
  onOuterRadiusBlur = () => {
    const {innerRadius, outerRadius} = this.state.inputs
    if (outerRadius && ! innerRadius) {
      this.setInput('innerRadius', String(Number(outerRadius) - RAIL_SPACE))
    }
  }

  renderContent = () => {
    // const { innerRadius, outerRadius, radius, centerAngle, name } = this.state.inputs
    return (
      <ValidatorForm
        ref={(form) => this._form = form}
      >
        {this.state.isDouble &&
          <>
            <AutoFocusTextValidator
              label="Inner Radius"
              type="number"
              name="innerRadius"
              key="innerRadius"
              value={this.state.inputs.innerRadius}
              onChange={this.onChange('innerRadius')}
              onKeyPress={this.onKeyPress}
              validatorListener={this.handleValidation}
              validators={['required']}
              errorMessages={['this field is required']}
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
              onKeyPress={this.onKeyPress}
              validatorListener={this.handleValidation}
              validators={['required']}
              errorMessages={['this field is required']}
              onBlur={this.onOuterRadiusBlur}
            />
          </>
        }
        {! this.state.isDouble &&
          <AutoFocusTextValidator
            label="Radius"
            type="number"
            name="radius"
            key="radius"
            value={this.state.inputs.radius}
            onChange={this.onChange('radius')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['required']}
            errorMessages={['this field is required']}
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
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required']}
          errorMessages={['this field is required']}
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
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required', 'isUniqueName']}
          errorMessages={['this field is required', 'The name already exists.']}
        />
      </ValidatorForm>
    )
  }
}
