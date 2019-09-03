// function postMessage(className, funcName, data) {
//   // parent.postMessage(JSON.stringify({className, funcName, data}), '*')
//   // console.info('postMessage:', className, funcName, args)
// }


export function PowerPacks(powerPacksData) {
  this.powerPacks = powerPacksData.map(p => new PowerPack(p))
}

PowerPacks.prototype.getById = function (id) {
  console.log('getById')
  let powerPack = this.powerPacks.find(p => p.id === id)
  if (!powerPack) {
    window.parent.postMessage({
      source: 'railroad-editor-script',
      type: 'error',
      data: {message: `PowerPack with id: ${id} not found`}
    }, '*');
    throw new Error()
  }
  return powerPack
}

PowerPacks.prototype.getByName = function (name) {
  console.log('getByName')
  let powerPack = this.powerPacks.find(p => p.name === name)
  if (!powerPack) {
    window.parent.postMessage({
      source: 'railroad-editor-script',
      type: 'error',
      data: {message: `PowerPack with name: ${name} not found`}
    }, '*');
    throw new Error()
  }
  return powerPack
}

export function PowerPack(powerPackData) {
  this.id = powerPackData.id
  this.power = powerPackData.power
  this.direction = powerPackData.direction
  this.onPowerChangeCallback = null
  this.onDirectionChange = null
}

PowerPack.prototype.setPower = function (power) {
  let data = {id: this.id, power: power, direction: this.direction}
  // notify to editor
  window.parent.postMessage({source: 'railroad-editor-script', type: 'setPower', data: data}, '*');
}

PowerPack.prototype.setDirection = function (direction) {
  let data = {id: this.id, power: this.power, direction: direction}
  // notify to editor
  window.parent.postMessage({source: 'railroad-editor-script', type: 'setDirection', data: data}, '*');
}

PowerPack.prototype.onPowerChange = function (callback) {
  this.onPowerChangeCallback = callback
}

PowerPack.prototype._updatePower = function (power) {
  if (this.power !== power && this.onPowerChangeCallback) {
    this.onPowerChangeCallback(power)
  }
  this.power = power
}
