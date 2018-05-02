import * as React from 'react'
import {DialogActions, DialogContent, DialogTitle} from "material-ui"
import Dialog from "material-ui/Dialog";
import Button from "material-ui/Button";
import {LayoutData, LayoutMeta} from "reducers/layout";
import * as md5 from "js-md5";
import LayoutAPI from "apis/layout"
import StorageAPI from "apis/storage"
import getLogger from "logging";
import * as moment from "moment";
import {UserRailGroupData} from "reducers/builder";
import AutoFocusTextField, {default as AutoFocusTextValidator} from "components/common/AutoFocusTextValidator";
import {RailItemData} from "components/rails";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';

const LOGGER = getLogger(__filename)

export interface SaveLayoutDialogProps extends FormDialogProps {
  layoutMeta?: LayoutMeta
  authData: any
  saveLayout: () => void
  setLayoutMeta: (meta: LayoutMeta) => void
}

export interface SaveLayoutDialogState extends FormDialogState {
}


export default class SaveLayoutDialog extends FormDialog<SaveLayoutDialogProps, SaveLayoutDialogState> {

  constructor(props: SaveLayoutDialogProps) {
    super(props)
    this.state = this.getInitialState()

    this.onOK = this.onOK.bind(this)
  }

  getInitialState = () => {
    return {
      inputs: {},
      disabled: true,
      pickerOpen: false,
      pickerAnchor: null,
    }
  }

  onOK = (e) => {
    const meta = this.setLayoutMeta()
    this.saveLayout(meta)
    this.props.onClose()
  }

  createLayoutId = () => {
    const time = new Date().getTime()
    const userId = this.props.authData.username
    return md5(`${userId}.${time}`)
  }

  setLayoutMeta = () => {
    let layoutId
    if (this.props.layoutMeta) {
      layoutId = this.props.layoutMeta.id
    } else {
      layoutId = this.createLayoutId()
    }
    const timestamp = moment().valueOf()
    const meta = {
      id: layoutId,
      name: this.state.inputs.name,
      lastModified: timestamp
    }
    this.props.setLayoutMeta(meta)
    return meta
  }

  saveLayout = async (meta) => {
    this.props.saveLayout()
    StorageAPI.saveCurrentLayoutImage(this.props.authData.username, meta.id)
  }


  renderValidators = () => {
    return (
      <ValidatorForm
        ref={(form) => this._form = form}
      >
        <AutoFocusTextValidator
          label="Layout Name"
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
