import * as React from 'react'
import getLogger from "logging";
import {LayoutConfig} from "store/layoutStore";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";

const LOGGER = getLogger(__filename)

export interface SettingsDialogProps extends FormDialogProps {
  config: LayoutConfig
  setConfig: (config: LayoutConfig) => void
}


export class SettingsDialog extends FormDialog<SettingsDialogProps, FormDialogState> {

  constructor(props: SettingsDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      inputs: _.mapValues(this.props.config, (v) => String(v)),
      disabled: false
    }
  }

  onOK = () => {
    // 設定値が全て文字列で入ってくるので、数値に変換を試みる
    const newConfig = _.mapValues(this.state.inputs, value => {
      const numVal = Number(value)
      return numVal ? numVal : value
    })

    LOGGER.info(newConfig)
    this.props.setConfig(newConfig as LayoutConfig)
    this.props.onClose()
  }


  renderValidators = () => {
    return (
      <ValidatorForm
        ref={(form) => this._form = form}
      >
        <TextValidator
          label="Paper Width"
          type="number"
          name="paperWidth"
          key="paperWidth"
          value={this.state.inputs.paperWidth}
          onChange={this.onChange('paperWidth')}
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required']}
          errorMessages={['this field is required']}
        />
        <TextValidator
          label="Paper Height"
          type="number"
          name="paperHeight"
          key="paperHeight"
          value={this.state.inputs.paperHeight}
          onChange={this.onChange('paperHeight')}
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required']}
          errorMessages={['this field is required']}
        />
        <TextValidator
          label="Grid Size"
          type="number"
          name="gridSize"
          key="gridSize"
          value={this.state.inputs.gridSize}
          onChange={this.onChange('gridSize')}
          onKeyPress={this.onKeyPress}
          validatorListener={this.handleValidation}
          validators={['required']}
          errorMessages={['this field is required']}
        />
      </ValidatorForm>
    )
  }
}
