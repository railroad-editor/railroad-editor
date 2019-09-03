import {FormDialog, FormDialogProps, FormDialogState} from "../../../../common/FormDialog/FormDialog";
import * as React from "react";
import Grid from "@material-ui/core/Grid";
import {compose} from "recompose";
import {withStyles} from "@material-ui/core";
import * as monaco from 'monaco-editor';
import {runInSandbox} from "./sandbox"
import {PowerPacks} from "./PowerPacks";
import {PowerPackData, SwitcherData} from "../../../../../store/layoutStore";

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
  powerPacks: PowerPackData[]
  switchers: SwitcherData[]
  classes: any
}

export interface ScriptDialogState extends FormDialogState {
}


export class ScriptDialog extends FormDialog<ScriptDialogProps, ScriptDialogState> {

  editor: any

  constructor(props: ScriptDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  componentDidMount() {
  }

  getInitialState = () => {
    return {
      ...super.getInitialState(),
    }
  }

  onEnter = () => {
    this.setState(this.getInitialState());

    this.editor = monaco.editor.create(document.getElementById('aaaa'), {
      value: [
        ` 
 const p = PowerPacks.getById(1);
 p.setPower(10); 
 p.onPowerChange(function(power) { console.log('power changed', power) })
`
      ].join('\n'),
      language: 'javascript'
    });
  }

  onOK = (e) => {
    let code = this.editor.getValue()
    code = `
      window.addEventListener('message', function(e) {
        const {type, func, payload} = e.data
        console.log('Message to railroad-editor-script: ', type, payload);
        
        const HANDLERS = {
          PowerPack: {
            setPower: function(payload) {
              const {id, power} = payload
              PowerPacks.getById(id)._updatePower(power)
            }
          }
        }
        HANDLERS[type][func](payload)
      })
    ` + code
    const sandboxGlobal = {
      PowerPacks: new PowerPacks(this.props.powerPacks),
    }
    const sandbox = runInSandbox(code, sandboxGlobal, false)
    sandbox.execute((data) => {
      if (data.source === 'railroad-editor-script') {
        console.log('Message from railroad-editor-script: ', data);
      }
    });

    setTimeout(() => {
      sandbox.postMessage({type: 'PowerPack', func: 'setPower', payload: {id: 1, power: 100}})
    }, 100)

    this.onClose()
  }

  renderContent = () => {
    return (
      <Grid container spacing={1} className={this.props.classes.grid}>
        <Grid id={'aaaa'} item xs={12}>
        </Grid>
      </Grid>
    )
  }
}

export default compose<ScriptDialogProps, ScriptDialogProps | any>(
  withStyles(styles),
)(ScriptDialog)
