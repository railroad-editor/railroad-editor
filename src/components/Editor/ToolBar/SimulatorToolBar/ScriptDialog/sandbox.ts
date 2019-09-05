import {PowerPacks} from "./PowerPacks";
import {LayoutStore} from "../../../../../store/layoutStore";
import {SimulatorStore} from "../../../../../store/simulatorStore";
import {Switchers} from "./Switchers";
import {LayoutLogicStore} from "../../../../../store/layoutLogicStore";


export class Sandbox {
  iframe: HTMLIFrameElement;
  callback: (ev: MessageEvent) => void

  constructor(code: string, globals: Object, callback: (ev: MessageEvent) => void) {
    let iframe = document.createElement('iframe');
    iframe.style.cssText = 'position: absolute; display: none; top: -9999em; left: -9999em; z-index: -1; width:' +
      ' 0px; height: 0px;';
    let script = `,<script>(function () { ${this.extend('window', globals)} ${code} }());</script>`;
    iframe.src = 'data:text/html' + script;
    this.iframe = iframe
    this.callback = callback
  }

  execute() {
    window.addEventListener('message', this.callback)
    document.body.appendChild(this.iframe);
  }

  destroy() {
    window.removeEventListener('message', this.callback);
    document.body.removeChild(this.iframe);
    this.iframe = this.callback = null
  }

  postMessage(message: any) {
    this.iframe.contentWindow.postMessage(message, '*');
  }

  private extend(dest: string, src: Object, arr: boolean = false): string {
    let property = null,
      ext = '',
      isArray = false,
      key;
    for (property in src) {
      key = arr ? '[' + property + ']' : '["' + property + '"]';
      ext += dest + key + ' = ';
      if (typeof src[property] === 'object' && src[property] !== null) {
        isArray = Object.prototype.toString.call(src[property]) === '[object Array]';
        ext += dest + key + (isArray ? ' || [];' : ' || {};');
        ext += this.extend(dest + key, src[property], isArray);
      } else if (typeof src[property] === 'function') {
        ext += src[property].toString() + ';';
      } else if (typeof src[property] === 'string') {
        ext += '"' + src[property] + '";';
      } else {
        ext += src[property] + ';';
      }
    }
    return ext;
  }
}


export class SimulatorSandbox extends Sandbox {

  static BASE_CODE = `
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
  `

  constructor(code: string, layout: LayoutStore, layoutLogic: LayoutLogicStore, simulator: SimulatorStore) {
    code = SimulatorSandbox.BASE_CODE + code
    const global = {
      PowerPacks: new PowerPacks(layout.currentLayoutData.powerPacks),
      Switchers: new Switchers(layout.currentLayoutData.switchers)
    }
    const handlerForScriptEvent = function (e) {
      const {source, type, func, payload} = e.data
      if (source !== 'simulator-script') {
        return
      }
      console.log('Message from simulator-script: ', type, func, payload);
      const HANDLERS = {
        PowerPack: {
          setPower: function (payload) {
            const {id, power} = payload
            layout.updatePowerPack({id, power})
          },
          setDirection: function (payload) {
            const {id, direction} = payload
            layout.updatePowerPack({id, direction})
          }
        },
        Switcher: {
          setDirection: function (payload) {
            const {id, direction} = payload
            layoutLogic.changeSwitcherState(id, direction)
          }
        },
        Error: {
          show: function (payload) {
            const {message} = payload
            simulator.setErrorSnackbar(true, 'Error: ' + message)
          }
        }
      }
      HANDLERS[type][func](payload)
    }
    super(code, global, handlerForScriptEvent)
  }


  setPowerPackPower(id: number, power: number) {
    this.postMessage({source: 'railroad-editor', type: 'PowerPack', func: 'setPower', payload: {id, power}})
  }

  setPowerPackDirection(id: number, direction: number) {
    this.postMessage({source: 'railroad-editor', type: 'PowerPack', func: 'setDirection', payload: {id, direction}})
  }

  setSwitcherDirection(id: number, direction: number) {
    this.postMessage({source: 'railroad-editor', type: 'Switcher', func: 'setDirection', payload: {id, direction}})
  }
}

