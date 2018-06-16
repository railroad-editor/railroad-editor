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
} from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitcherSettingDialog/styles";


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
        </ValidatorForm>
        <Spacer />

        {/* Rail color */}
        <Grid container justify="center" alignItems="center" spacing={0}>
          <Grid item xs={6}>
            <Typography align="center" variant="body2">
              Rail Color
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
