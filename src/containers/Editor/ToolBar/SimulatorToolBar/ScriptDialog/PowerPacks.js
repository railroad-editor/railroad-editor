

export function PowerPacks(powerPacksData) {
  this.powerPacks = powerPacksData.map(p => new PowerPack(p))
}

PowerPacks.prototype.getById = function (id) {
  console.log('getById', id)
  let powerPack = this.powerPacks.find(p => p.id === id)
  if (!powerPack) {
    window.parent.postMessage({
      source: 'simulator-script',
      type: 'Error',
      func: 'show',
      payload: {message: `PowerPack with ID: ${id} not found`}
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
      source: 'simulator-script',
      type: 'Error',
      func: 'show',
      payload: {message: `PowerPack with name: ${name} not found`}
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
  this.onDirectionChangeCallback = null
}

PowerPack.prototype.setPower = function (power) {
  let payload = {id: this.id, power: power}
  // notify to editor
  window.parent.postMessage({source: 'simulator-script', type: 'PowerPack', func: 'setPower', payload: payload}, '*');
}

PowerPack.prototype.setDirection = function (direction) {
  let payload = {id: this.id, direction: direction}
  // notify to editor
  window.parent.postMessage({
    source: 'simulator-script',
    type: 'PowerPack',
    func: 'setDirection',
    payload: payload
  }, '*');
  this.direction = direction
}

PowerPack.prototype.onPowerChange = function (callback) {
  this.onPowerChangeCallback = callback
}

PowerPack.prototype.onDirectionChange = function (callback) {
  this.onDirectionChangeCallback = callback
}

PowerPack.prototype._updatePower = function (power) {
  if (this.power !== power && this.onPowerChangeCallback) {
    this.onPowerChangeCallback(power)
  }
  this.power = power
}

PowerPack.prototype._updateDirection = function (direction) {
  if (this.direction !== direction && this.onDirectionChangeCallback) {
    this.onDirectionChangeCallback(direction)
  }
  this.direction = direction
}
