import * as React from "react";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {SwitcherData} from "store/layoutStore";
import {
  SmallButton,
  Spacer
} from "components/Editor/Palettes/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitcherSettingDialog/styles";


export interface SwitcherSettingDialogProps extends FormDialogProps {
  switcher: SwitcherData
  updateSwitcher: (item: Partial<SwitcherData>) => void
}

export interface SwitcherSettingDialogState extends FormDialogState {
  pickerOpen: boolean
  pickerAnchor: HTMLElement
}


export default class SwitcherSettingDialog extends FormDialog<SwitcherSettingDialogProps, SwitcherSettingDialogState> {

  anchorEl: any

  constructor(props: SwitcherSettingDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      inputs: _.mapValues(this.props.switcher, (v) => String(v)),
      disabled: true,
      pickerOpen: false,
      pickerAnchor: null,
    }
  }

  onOK = (e) => {
    this.props.updateSwitcher({
      ...this.props.switcher,
      name: this.state.inputs.name,
      color: this.state.inputs.color,
      dPin1: Number(this.state.inputs.dPin1),
      dPin2: Number(this.state.inputs.dPin2)
    })
    this.onClose()
  }

  openColorPicker = (e) => {
    this.setState({
      pickerOpen: true
    })
  }

  onColorChange = (color) => {
    this.setState({
      inputs: {
        ...this.state.inputs,
        color: color.hex
      }
    })
  }

  closeColorPicker = (e) => {
    this.setState({
      pickerOpen: false
    })
  }

  renderContent = () => {
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
          <br />
          <TextValidator
            label="Digital Pin 1"
            name="dPin1"
            key="dPin1"
            value={this.state.inputs.dPin1}
            onChange={this.onChange('dPin1')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['matchRegexp:^[0-9]*$']}
            errorMessages={['value must be a number']}
          />
          <TextValidator
            label="Digital Pin 2"
            name="dPin2"
            key="dPin2"
            value={this.state.inputs.dPin2}
            onChange={this.onChange('dPin2')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['matchRegexp:^[0-9]*$']}
            errorMessages={['value must be a number']}
          />
        </ValidatorForm>
        <Spacer />

        {/* Switcher color */}
        <Grid container justify="center" alignItems="center" spacing={0}>
          <Grid item xs={6}>
            <Typography align="center" variant="body2">
              Switcher Color
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <SmallButton
              onClick={this.openColorPicker}
              buttonRef={ref => this.anchorEl = ref}
              style={{backgroundColor: this.state.inputs.color}}
              variant="raised"
            />
          </Grid>
        </Grid>
        {/* Color picker */}
        <Popover
          open={this.state.pickerOpen}
          onClose={this.closeColorPicker}
          anchorEl={this.anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          <ChromePicker
            color={ this.state.inputs.color }
            onChangeComplete={ this.onColorChange }
          />
        </Popover>
      </>
    )
  }
}
