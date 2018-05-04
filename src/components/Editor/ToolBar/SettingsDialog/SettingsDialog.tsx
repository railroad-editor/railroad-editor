import * as React from 'react'
import getLogger from "logging";
import {LayoutConfig, LayoutMeta} from "store/layoutStore";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import "react-fine-uploader/gallery/gallery.css";
import Button from "material-ui/Button";
import styled from "styled-components";
import Grid from "material-ui/Grid";
import Typography from "material-ui/Typography";
import {Spacer} from "components/Editor/LayerPalette/LayerSettingDialog/styles";
import Image from 'material-ui-image'



const Thumbnail = styled(Image)`
  && {
    width: 100px;
    height: 100px;
  }
`


const LOGGER = getLogger(__filename)

export interface SettingsDialogProps extends FormDialogProps {
  config: LayoutConfig
  setConfig: (config: LayoutConfig) => void
  userInfo: any
  layoutMeta: LayoutMeta
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
    this.props.setConfig(newConfig)
    this.onClose()
  }

  handleFile = (e) => {
    const file = e.target.files[0]
    console.log(e.target.files)
    const fr = new FileReader()
    fr.onload = () => {
      const data = fr.result
      this.setInput('backgroundImageUrl', data)
    }
    fr.readAsDataURL(file)
  }

  renderContent = () => {
    return (
      <React.Fragment>
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

        <Spacer/>
        <Grid container justify="center" alignItems="center" spacing={0}>
          <Grid item xs={4}>
            <Typography align="left" variant="body2">
              Background Image
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Button component="label" variant="raised" color="primary">
              Upload File
              <input
                onChange={this.handleFile}
                style={{ display: 'none' }}
                type="file"
              />
            </Button>
          </Grid>
          <Grid item xs={4}>
            {this.state.inputs['backgroundImageUrl'] &&
            <Thumbnail src={this.state.inputs['backgroundImageUrl']}/>
            }
          </Grid>
        </Grid>
      </React.Fragment>
    )
  }
}
