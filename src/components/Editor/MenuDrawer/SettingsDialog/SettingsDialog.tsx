import * as React from 'react'
import {DialogActions, DialogContent, DialogTitle, FormControl, InputLabel} from "material-ui"
import Dialog from "material-ui/Dialog";
import Button from "material-ui/Button";
import getLogger from "logging";
import Input from "material-ui/Input";
import {SettingsStoreState} from "reducers/settings";

const LOGGER = getLogger(__filename)

export interface SettingsDialogProps {
  open: boolean
  onClose: () => void
  save?: boolean

  settings: SettingsStoreState
  setConfig: (settings: SettingsStoreState) => void
}

export class SettingsDialog extends React.Component<SettingsDialogProps, SettingsStoreState> {

  constructor(props: SettingsDialogProps) {
    super(props)
    this.state = this.props.settings

    this.onOK = this.onOK.bind(this)
  }

  onChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onOK = (e) => {
    // 設定値が全て文字列で入ってくるので、数値に変換を試みる
    const newSettings = {}
    Object.keys(this.state).forEach(key => {
      const strVal = this.state[key]
      const numVal = Number(this.state[key])
      newSettings[key] = numVal ? numVal : strVal
    })

    this.props.setConfig(newSettings as SettingsStoreState)
    this.props.onClose()
  }


  render() {
    const { open, onClose } = this.props
    const newSettings = this.state

    return (
      <Dialog
        open={open}
        onClose={onClose}
      >
        <DialogTitle id={"settings"}>Settings</DialogTitle>
        <DialogContent>
          <form>
            <FormControl>
              <InputLabel htmlFor="paper-width-input">Paper Width</InputLabel>
              <Input
                id="paper-width-input"
                type="number"
                value={newSettings.paperWidth}
                onChange={this.onChange('paperWidth')}
              />
              {/*<FormHelperText>Alignment with an input</FormHelperText>*/}
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="paper-height-input">Paper Height</InputLabel>
              <Input
                id="paper-height-input"
                type="number"
                value={newSettings.paperHeight}
                onChange={this.onChange('paperHeight')}
              />
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="grid-size-input">Grid Size</InputLabel>
              <Input
                id="grid-size-input"
                type="number"
                value={newSettings.gridSize}
                onChange={this.onChange('gridSize')}
              />
            </FormControl>
            <FormControl>
              <InputLabel htmlFor="initial-zoom-input">Initial Zoom</InputLabel>
              <Input
                id="initial-zoom-input"
                type="number"
                value={newSettings.initialZoom}
                onChange={this.onChange('initialZoom')}
              />
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button variant="raised" onClick={this.onOK} color="primary">
            OK
          </Button>
          <Button onClick={onClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
