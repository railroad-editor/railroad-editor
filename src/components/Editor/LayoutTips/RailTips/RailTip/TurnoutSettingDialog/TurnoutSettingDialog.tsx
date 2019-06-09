import * as React from "react";
import AutoFocusTextValidator from "components/common/AutoFocusTextValidator";
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import {ValidatorForm} from 'react-material-ui-form-validator';
import {FormControl, InputLabel, List, ListItem, MenuItem, Select} from "@material-ui/core";
import {ConductionStates, LayoutStore, SwitcherData, SwitcherType} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";
import {RailData} from "components/rails";


export interface TurnoutSettingDialogProps extends FormDialogProps {
  rail: RailData
  switchers: SwitcherData[]
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
}

export interface TurnoutSettingDialogState extends FormDialogState {
  connectedSwitcherId: number
  conductionStates: ConductionStates
}


@inject(STORE_LAYOUT, STORE_LAYOUT_LOGIC)
@observer
export default class TurnoutSettingDialog extends FormDialog<TurnoutSettingDialogProps, TurnoutSettingDialogState> {

  anchorEl: any

  constructor(props: TurnoutSettingDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }


  getInitialState = () => {
    const {rail, switchers} = this.props
    const conductionStates = {}
    let connectedSwitcher = null

    for (let sw of switchers) {
      _.keys(sw.conductionStates).forEach(idx => {
        const state = sw.conductionStates[idx].find(state => state.railId === rail.id)
        if (state) {
          if (! conductionStates[idx]) {
            conductionStates[idx] = []
          }
          conductionStates[idx].push(state)
        }
      })
      if (_.keys(conductionStates).length > 0) {
        connectedSwitcher = sw
        break
      }
    }

    const connectedSwitcherId = connectedSwitcher ? connectedSwitcher.id : null
    return {
      inputs: _.mapValues(this.props.rail, (v) => String(v)),
      disabled: false,
      connectedSwitcherId: connectedSwitcherId,
      conductionStates: conductionStates
    }
  }

  onOK = (e) => {
    this.props.layout.updateRail({
      ...this.props.rail,
      turnoutName: this.state.inputs.turnoutName,
    })
    if (this.state.connectedSwitcherId) {
      this.props.layoutLogic.connectTurnoutToSwitcher(
        this.props.rail.id, this.state.conductionStates, this.state.connectedSwitcherId)
    } else {
      // this.props.layoutLogic.disconnectFeederFromSwitcher(this.props.feeder.id, this.state.connectedSwitcherId)
    }
    this.onClose()
  }

  onChangeConnectedSwitcher = (e) => {
    // currentTarget は使ってはいけない
    const switcherId = e.target.value ? Number(e.target.value) : null
    this.setState({
      connectedSwitcherId: switcherId,
      conductionStates: {
        0: [{
          railId: this.props.rail.id,
          conductionState: 0
        }],
        1: [{
          railId: this.props.rail.id,
          conductionState: 1
        }]
      }
    })
  }


  renderContent = () => {
    const {rail, switchers} = this.props
    const {connectedSwitcherId, conductionStates} = this.state
    const connectedSwitcher = switchers.find(sw => sw.id === connectedSwitcherId)

    let conductionStatesPart
    if (connectedSwitcher && connectedSwitcher.type === SwitcherType.NORMAL) {
      conductionStatesPart = (
        <List>
          {_.keys(conductionStates).map(idx => {
            return (
              <ListItem button>
                {idx}
              </ListItem>
            )
          })}
        </List>
      )
    }

    return (
      <>
        <ValidatorForm
          ref={(form) => this._form = form}
        >
          <AutoFocusTextValidator
            label="Turnout Name"
            name="name"
            key="name"
            value={this.state.inputs.turnoutName}
            onChange={this.onChange('turnoutName')}
            onKeyPress={this.onKeyPress}
            validatorListener={this.handleValidation}
            validators={['required']}
            errorMessages={['this field is required']}
            withRequiredValidator={true}
          />
        </ValidatorForm>
        <form>
          <FormControl style={{width: '100%'}}>
            <InputLabel>Switcher</InputLabel>
            <Select
              value={this.state.connectedSwitcherId}
              onChange={this.onChangeConnectedSwitcher}
              autoWidth
              displayEmpty
            >
              <MenuItem value={null}>
              </MenuItem>
              {
                switchers.map(p => {
                  return (
                    <MenuItem value={p.id}>
                      {p.name}
                    </MenuItem>
                  )
                })
              }
            </Select>
          </FormControl>
        </form>

        {/*{conductionStatesPart}*/}
      </>
    )
  }
}
