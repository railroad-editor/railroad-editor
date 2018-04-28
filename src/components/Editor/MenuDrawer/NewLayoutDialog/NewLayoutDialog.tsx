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
import AutoFocusTextField from "components/common/AutoFocusTextField";
import {RailItemData} from "components/rails";

const LOGGER = getLogger(__filename)

export interface NewLayoutDialogProps {
  title: string
  okButtonTitle: string
  open: boolean
  onClose: () => void
  save?: boolean

  authData: any
  layoutMeta: LayoutMeta
  setLayoutMeta: (meta: LayoutMeta) => void
  currentLayoutData: LayoutData
  userRailGroups: UserRailGroupData[]
  userCustomRails: RailItemData[]
}

export interface NewLayoutDialogState {
  name: string
  isError: boolean
  errorText: string
}


export class NewLayoutDialog extends React.Component<NewLayoutDialogProps, NewLayoutDialogState> {

  constructor(props: NewLayoutDialogProps) {
    super(props)
    this.state = {
      name: '',
      isError: false,
      errorText: ' '
    }

    this.onOK = this.onOK.bind(this)
    this.onTextChange = this.onTextChange.bind(this)
  }

  onEnter = (e) => {
    this.setState({
      name: ''
    })
  }

  onOK = (e) => {
    // レイアウトのメタ情報を更新する
    const meta = this.setLayoutMeta()
    // 必要ならレイアウトを保存する
    if (this.props.save) {
      this.save(meta)
    }
    this.props.onClose()
  }

  onTextChange(e: React.SyntheticEvent<any>) {
    const text = e.currentTarget.value
    if (text && text.match(/.{4,}/)) {
      this.setState({
        name: text,
        isError: false,
        errorText: ' '
      })
    } else {
      this.setState({
        name: text,
        isError: true,
        errorText: 'Must be over 4 characters'
      })
    }
  }

  /**
   * レイアウトのメタ情報を更新する。
   * IDがnullなら新たに生成する。
   */
  setLayoutMeta = () => {
    let layoutId
    if (this.props.layoutMeta) {
      layoutId = this.props.layoutMeta.id
    } else {
      layoutId = this.createLayoutId()
    }
    const timestamp = moment().valueOf()
    const meta: LayoutMeta = {
      id: layoutId,
      name: this.state.name,
      lastModified: timestamp
    }
    this.props.setLayoutMeta(meta)
    return meta
  }

  /**
   * ユーザーIDとタイムスタンプからハッシュ値を計算してレイアウトIDを生成する。
   */
  createLayoutId = () => {
    const time = new Date().getTime()
    const userId = this.props.authData.username
    return md5(`${userId}.${time}`)
  }

  /**
   * このダイアログで生成したMetaデータを使ってレイアウトを保存する
   * @param {LayoutMeta} meta
   * @returns {Promise<void>}
   */
  save = async (meta: LayoutMeta) => {
    const {authData, currentLayoutData, userRailGroups, userCustomRails} = this.props
    const userId = authData.username
    const savedData = {
      layout: currentLayoutData,
      meta: meta,
      userRailGroups: userRailGroups,
      userCustomRails: userCustomRails,
    }
    LOGGER.info(savedData)
    LayoutAPI.saveLayoutData(userId, savedData)
    StorageAPI.saveCurrentLayoutImage(userId, meta.id)
  }

  render() {
    const { open, onClose, title, okButtonTitle } = this.props

    return (
      <Dialog
        open={open}
        onEnter={this.onEnter}
        onClose={onClose}
      >
        <DialogTitle id={title}>{title}</DialogTitle>
        <DialogContent>
          <AutoFocusTextField
            error={this.state.isError}
            autoFocus
            margin="normal"
            id="layout-name"
            label="Layout Name"
            helperText={this.state.errorText}
            onChange={this.onTextChange}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={this.state.isError || ! this.state.name} variant="raised" onClick={this.onOK} color="primary">
            {okButtonTitle}
          </Button>
          <Button onClick={onClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
