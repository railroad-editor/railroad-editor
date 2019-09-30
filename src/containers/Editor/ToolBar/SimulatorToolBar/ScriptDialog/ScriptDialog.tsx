import {FormDialogBase, FormDialogProps, FormDialogState} from "containers/common/FormDialog/FormDialogBase";
import * as React from "react";
import Grid from "@material-ui/core/Grid";
import {compose} from "recompose";
import {FormControlLabel, Switch, withStyles} from "@material-ui/core";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {SandboxStore} from "store/sandboxStore";
import MonacoEditor from "react-monaco-editor";
import {STORE_LAYOUT, STORE_SANDBOX} from "store/constants";

const styles = theme => ({
  grid: {
    paddingTop: '20px',
    width: '800px',
    height: '600px'
  },
  type: {
    minWidth: '160px'
  },
});

export interface ScriptDialogProps extends FormDialogProps {
  layout?: LayoutStore
  sandbox?: SandboxStore
  classes: any
}

export interface ScriptDialogState extends FormDialogState {
  enableScript: boolean
  code: string
}


@inject(STORE_LAYOUT, STORE_SANDBOX)
@observer
export class ScriptDialog extends FormDialogBase<ScriptDialogProps, ScriptDialogState> {

  constructor(props: ScriptDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      ...super.getInitialState(),
      code: this.props.layout.currentLayoutData.script,
      enableScript: this.props.sandbox.sandboxEnabled
    }
  }

  onEnter = () => {
    this.setState(this.getInitialState())
  }

  editorDidMount = (editor, monaco) => {
    console.log('editorDidMount', editor);
    editor.focus();
  }

  editorWillMount = (monaco) => {
    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      allowNonTsExtensions: true
    });
    monaco.languages.typescript.javascriptDefaults.addExtraLib([
      `
       declare class PowerPacks {
         static getById(id: number): PowerPack
         static getByName(name: string): PowerPack
       }
       
       declare class PowerPack {
         setPower(power: number): void
         setDirection(direction: number): void
        
         onPowerChange(callback: (power: number) => void)
         onDirectionChange(callback: (direction: number) => void)
       }
       
       declare class Switchers {
         static getById(id: number): Switcher
         static getByName(name: string): Switcher
       }
       
       declare class Switcher {
         setDirection(direction: number): void
         onDirectionChange(callback: (direction: number) => void)
       }
      `
    ].join('\n'), 'filename/facts.d.ts');
  }

  onOK = (e) => {
    this.props.layout.setScript(this.state.code)
    this.props.sandbox.setSandboxEnabled(this.state.enableScript)
    this.onClose()
  }

  onCodeChange = (newValue, e) => {
    this.setState({
      code: newValue
    })
  }

  onSwitchChange = (e) => {
    this.setState({
      enableScript: e.target.checked
    })
  }

  renderContent = () => {
    return (
      <Grid container spacing={1} className={this.props.classes.grid}>
        <Grid item xs={12}>
          <MonacoEditor
            width="800"
            height="500"
            language="javascript"
            // theme="vs-dark"
            value={this.state.code}
            options={{
              fontSize: 14,
              scrollBeyondLastLine: false,
              minimap: {
                enabled: false
              }
            }}
            onChange={this.onCodeChange}
            editorWillMount={this.editorWillMount}
            editorDidMount={this.editorDidMount}

          />
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
