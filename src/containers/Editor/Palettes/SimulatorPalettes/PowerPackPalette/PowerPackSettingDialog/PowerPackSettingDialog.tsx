import * as React from "react";
import AutoFocusTextValidator from "containers/common/AutoFocusTextValidator";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import {FormDialogBase, FormDialogProps, FormDialogState} from "containers/common/FormDialog/FormDialogBase";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {PowerPackData} from "stores/layoutStore";
import {
  SmallButton,
  Spacer
} from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackSettingDialog/styles";


export interface PowerPackSettingDialogProps extends FormDialogProps {
  powerPack: PowerPackData
  updatePowerPack: (item: Partial<PowerPackData>) => void
}

export interface PowerPackSettingDialogState extends FormDialogState {
  pickerOpen: boolean
  pickerAnchor: HTMLElement
}


export default class PowerPackSettingDialog extends FormDialogBase<PowerPackSettingDialogProps, PowerPackSettingDialogState> {

  anchorEl: any

  constructor(props: PowerPackSettingDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialInputs = () => {
    return _.mapValues(this.props.powerPack, (v) => String(v))
  }

  getInitialState = () => {
    return {
      ...super.getInitialState(),
      pickerOpen: false,
      pickerAnchor: null,
    }
  }

  onOK = (e) => {
    this.props.updatePowerPack({
      ...this.props.powerPack,
      name: this.state.inputs.name,
      color: this.state.inputs.color,
      pPin: Number(this.state.inputs.pPin),
      dPin: Number(this.state.inputs.dPin)
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
          />
          <br/>
          <TextValidator
            label="PWM Pin"
            name="pPin"
            key="pPin"
            value={this.state.inputs.pPin}
            onChange={this.onChange('pPin')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['matchRegexp:^[0-9]*$']}
            errorMessages={['value must be a number']}
          />
          <TextValidator
            label="Digital Pin"
            name="dPin"
            key="dPin"
            value={this.state.inputs.dPin}
            onChange={this.onChange('dPin')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['matchRegexp:^[0-9]*$']}
            errorMessages={['value must be a number']}
          />
        </ValidatorForm>
        <Spacer/>

        {/* Power pack color */}
        <Grid container justify="center" alignItems="center" spacing={0}>
          <Grid item xs={6}>
            <Typography align="center" variant="body2">
              Power Pack Color
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <SmallButton
              onClick={this.openColorPicker}
              buttonRef={ref => this.anchorEl = ref}
              style={{backgroundColor: this.state.inputs.color}}
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
            color={this.state.inputs.color}
            onChangeComplete={this.onColorChange}
          />
        </Popover>
      </>
    )
  }
}
