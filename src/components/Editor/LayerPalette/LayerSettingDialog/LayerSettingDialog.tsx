import * as React from "react";
import Dialog from "material-ui/Dialog";
import {DialogActions, DialogContent, DialogTitle, FormControl} from "material-ui";
import Button from "material-ui/Button";
import AutoFocusTextField from "components/common/AutoFocusTextField";
import ChromePicker from "react-color/lib/components/chrome/Chrome";
import Popover from "material-ui/Popover";
import Typography from "material-ui/Typography";
import Grid from "material-ui/Grid";
import {SmallButton} from "components/Editor/LayerPalette/LayerSettingDialog/styles";
import {LayerData} from "reducers/layout";


export interface LayerSettingDialogProps {
  title: string
  open: boolean
  onClose: () => void
  layerId?: number

  layers: LayerData[]
  activeLayerId: number
  nextLayerId: number

  setActiveLayer: (layerId: number) => void
  updateLayer: (item: Partial<LayerData>) => void
  addLayer: (item: LayerData) => void
  deleteLayer: (itemId: number) => void
}

export interface LayerSettingDialogState {
  name: string
  isError: boolean
  errorText: string
  pickerOpen: boolean
  pickerAnchor: HTMLElement
  color: string
}


export class LayerSettingDialog extends React.Component<LayerSettingDialogProps, LayerSettingDialogState> {

  static INITIAL_STATE = {
    name: '',
    isError: false,
    errorText: ' ',
    pickerOpen: false,
    pickerAnchor: null,
    color: '#000',
  }

  anchorEl: any

  constructor(props: LayerSettingDialogProps) {
    super(props)
    this.state = LayerSettingDialog.INITIAL_STATE

    this.onOK = this.onOK.bind(this)
    this.onTextChange = this.onTextChange.bind(this)
  }

  onEnter = (e) => {
    const {layers, layerId} = this.props
    if (layerId) {
      // レイヤーIDが与えられていればそのレイヤーデータを入れる
      const targetLayer = layers.find(layer => layer.id === layerId)
      const {id, ...rest} = targetLayer
      this.setState({
          ...LayerSettingDialog.INITIAL_STATE,
          ...rest
        } as any
      )
    } else {
      // レイヤーIDが無ければ完全初期化
      this.setState(LayerSettingDialog.INITIAL_STATE)
    }
  }

  onOK = (e) => {
    const {layers, layerId} = this.props
    if (layerId) {
      // レイヤーIDが与えられていれば更新
      const targetLayer = layers.find(layer => layer.id === layerId)
      if (targetLayer) {
        this.props.updateLayer({
          id: targetLayer.id,
          name: this.state.name,
          color: this.state.color,
        })
      }
    } else {
      // レイヤーIDが無ければ新規作成
      this.props.addLayer({
        id: this.props.nextLayerId,
        name: this.state.name,
        visible: true,
        color: this.state.color
      })
    }

    this.props.onClose()
  }


  onTextChange = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const text = e.currentTarget.value
    if (text && text.match(/.+/)) {
      this.setState({
        name: text,
        isError: false,
        errorText: ' '
      })
    } else {
      this.setState({
        name: text,
        isError: true,
        errorText: 'Must not be empty.'
      })
    }
  }

  openColorPicker = (e) => {
    this.setState({
      pickerOpen: true
    })
  }

  onColorChange = (color) => {
    this.setState({ color: color.hex });
  }

  closeColorPicker = (e) => {
    this.setState({
      pickerOpen: false
    })
  }


  render() {
    const { open, onClose, title } = this.props

    return (
      <Dialog
        open={open}
        onEnter={this.onEnter}
        onClose={onClose}
      >
        <DialogTitle id={title}>{title}</DialogTitle>
        <DialogContent>
          {/* レイヤー名 */}
          <FormControl>
            <AutoFocusTextField
              error={this.state.isError}
              autoFocus
              margin="dense"
              id="layer-name"
              label="Layer Name"
              value={this.state.name}
              helperText={this.state.errorText}
              onChange={this.onTextChange}
            />
          </FormControl>
          {/* レールの色 */}
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
                style={{backgroundColor: this.state.color}}
                variant="raised"
              />
            </Grid>
          </Grid>
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
              color={ this.state.color }
              onChangeComplete={ this.onColorChange }
            />
          </Popover>
        </DialogContent>
        <DialogActions>
          <Button disabled={this.state.isError || ! this.state.name} variant="raised" onClick={this.onOK} color="primary">
            OK
          </Button>
          <Button onClick={this.props.onClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
