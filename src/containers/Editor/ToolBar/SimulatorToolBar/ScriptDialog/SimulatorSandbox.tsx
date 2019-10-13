import * as React from "react";
import {PowerPackData, SwitcherData} from "stores/layoutStore";
import {Sandbox} from "./Sandbox";
import {PowerPacks} from "./PowerPacks";
import {Switchers} from "./Switchers";
import {observer} from "mobx-react";


const BASE_CODE = `
      window.addEventListener('message', function(e) {
        const {source, type, func, payload} = e.data
        if (source !== 'railroad-editor') {
          return
        }
        console.log('Message from railroad-editor: ', type, func, payload);
        const HANDLERS = {
          PowerPack: {
            setPower: function(payload) {
              const {id, power} = payload
              PowerPacks.getById(id)._updatePower(power)
            },
            setDirection: function (payload) {
              const {id, direction} = payload
              PowerPacks.getById(id)._updateDirection(direction)
            }
          },
          Switcher: {
            setDirection: function(payload) {
              const {id, direction} = payload
              Switchers.getById(id)._updateDirection(direction)
            }
          }
        }
        HANDLERS[type][func](payload)
      });
`;

export interface SimulatorSandboxProps {
  code: string
  powerPacks: PowerPackData[]
  switchers: SwitcherData[]
  onSetPowerPackPower: (id: number, power: number) => void
  onSetPowerPackDirection: (id: number, direction: number) => void
  onSetSwitcherDirection: (id: number, direction: number) => void
  onError: (message: string) => void
}


@observer
export class SimulatorSandbox extends React.Component<SimulatorSandboxProps, {}> {

  sandboxRef: any

  setPowerPackPower(id: number, power: number) {
    this.sandboxRef.postMessage({
      source: 'railroad-editor',
      type: 'PowerPack',
      func: 'setPower',
      payload: {id, power}
    })
  }

  setPowerPackDirection(id: number, direction: number) {
    this.sandboxRef.postMessage({
      source: 'railroad-editor',
      type: 'PowerPack',
      func: 'setDirection',
      payload: {id, direction}
    })
  }

  setSwitcherDirection(id: number, direction: number) {
    this.sandboxRef.postMessage({
      source: 'railroad-editor',
      type: 'Switcher',
      func: 'setDirection',
      payload: {id, direction}
    })
  }

  render() {
    const props = this.props
    const code = BASE_CODE + props.code
    const globals = {
      PowerPacks: new PowerPacks(props.powerPacks),
      Switchers: new Switchers(props.switchers)
    }
    const handlerForScriptEvent = function (e) {
      const {source, type, func, payload} = e.data
      if (source !== 'simulator-script') {
        return
      }
      // console.log('Message from simulator-script: ', type, func, payload);
      const HANDLERS = {
        PowerPack: {
          setPower: function (payload) {
            const {id, power} = payload
            props.onSetPowerPackPower(id, power)
          },
          setDirection: function (payload) {
            const {id, direction} = payload
            props.onSetPowerPackDirection(id, direction)
          }
        },
        Switcher: {
          setDirection: function (payload) {
            const {id, direction} = payload
            props.onSetSwitcherDirection(id, direction)
          }
        },
        Error: {
          show: function (payload) {
            const {message} = payload
            props.onError(message)
          }
        }
      }
      HANDLERS[type][func](payload)
    };

    return (
      <Sandbox
        ref={this.getRef}
        code={code}
        globals={globals}
        onMessage={handlerForScriptEvent}
      />
    );
  }

  getRef = (ref) => {
    if (ref) this.sandboxRef = ref
  }
}

