import {FormDialog, FormDialogProps, FormDialogState} from "../../../../common/FormDialog/FormDialog";
import * as React from "react";
import Grid from "@material-ui/core/Grid";
import {compose} from "recompose";
import {FormControlLabel, Switch, withStyles} from "@material-ui/core";
import * as monaco from 'monaco-editor';
import {editor} from 'monaco-editor';
import {SimulatorSandbox} from "./sandbox"
import {LayoutStore} from "../../../../../store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_LAYOUT, STORE_SIMULATOR} from "../../../../../constants/stores";
import {SimulatorStore} from "../../../../../store/simulatorStore";

const styles = theme => ({
  grid: {
    width: '800px',
    height: '600px'
  },
  type: {
    minWidth: '160px'
  },
});

export interface ScriptDialogProps extends FormDialogProps {
  layout?: LayoutStore
  simulator?: SimulatorStore
  classes: any
}

export interface ScriptDialogState extends FormDialogState {
  enableScript: boolean
}


@inject(STORE_LAYOUT, STORE_SIMULATOR)
@observer
export class ScriptDialog extends FormDialog<ScriptDialogProps, ScriptDialogState> {

  editor: editor.IStandaloneCodeEditor

  constructor(props: ScriptDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidMount() {
  }

  getInitialState = () => {
    return {
      ...super.getInitialState(),
      enableScript: this.props.simulator.sandboxEnabled
    }
  }

  onEnter = () => {
    this.setState(this.getInitialState());
    // initialize monaco-editor
    this.editor = monaco.editor.create(document.getElementById('simulator-script-editor'), {
      value: this.props.layout.currentLayoutData.script,
      language: 'javascript'
    });
  }

  onOK = (e) => {
    const code = this.editor.getValue()
    if (this.state.enableScript) {
      // recreate sandbox and execute
      const sandbox = new SimulatorSandbox(code, this.props.layout, this.props.simulator)
      sandbox.execute()
      this.props.simulator.setSandbox(sandbox)
    } else {
      this.props.simulator.setSandbox(null)
    }
    this.props.layout.setScript(code)
    this.onClose()
  }

  onSwitchChange = (e) => {
    this.setState({
      enableScript: e.target.checked
    })
  }

  renderContent = () => {
    return (
      <Grid container spacing={1} className={this.props.classes.grid}>
        <Grid id={'simulator-script-editor'} item xs={12}>
        </Grid>
        <FormControlLabel
          control={
            <Switch
              checked={this.state.enableScript}
              onChange={this.onSwitchChange}
              value="checkedA"
            />}
          label={"Enable Script"}
        />

      </Grid>
    )
  }
}

export default compose<ScriptDialogProps, ScriptDialogProps | any>(
  withStyles(styles),
)(ScriptDialog)
