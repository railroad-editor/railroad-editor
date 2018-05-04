import * as React from "react";
import Dialog from "material-ui/Dialog";
import {DialogActions, DialogContent, DialogTitle, FormControl} from "material-ui";
import Button from "material-ui/Button";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import Popover from "material-ui/Popover";
import Typography from "material-ui/Typography";
import Grid from "material-ui/Grid";
import {SmallButton, Spacer} from "components/Editor/LayerPalette/LayerSettingDialog/styles";
import {LayerData} from "reducers/layout";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';


export interface LayerSettingDialogProps extends FormDialogProps {
  layer: LayerData
  addLayer?: (item: LayerData) => void
  updateLayer?: (item: Partial<LayerData>) => void
}

export interface LayerSettingDialogState extends FormDialogState {
  pickerOpen: boolean
  pickerAnchor: HTMLElement
}


export default class LayerSettingDialog extends FormDialog<LayerSettingDialogProps, LayerSettingDialogState> {

  anchorEl: any

  constructor(props: LayerSettingDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      inputs: _.mapValues(this.props.layer, (v) => String(v)),
      disabled: true,
      pickerOpen: false,
      pickerAnchor: null,
    }
  }

  onOK = (e) => {
    if (this.props.addLayer) {
      this.props.addLayer({
          id: 0,
          name: this.state.inputs.name,
          color: this.state.inputs.color,
          visible: true
        }
      )
    }
    if (this.props.updateLayer) {
      this.props.updateLayer({
        ...this.props.layer,
        name: this.state.inputs.name,
        color: this.state.inputs.color,
      })
    }
    this.props.onClose()
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

  renderValidators = () => {
    return (
      <React.Fragment>
        <ValidatorForm
          ref={(form) => this._form = form}
        >
          <AutoFocusTextValidator
            label="Layer Name"
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
      </React.Fragment>
    )
  }
}
