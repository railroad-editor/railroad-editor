export function Switchers(switchersData) {
  this.switchers = switchersData.map(p => new Switcher(p))
}

Switchers.prototype.getById = function (id) {
  console.log('Switcher getById', id)
  let switcher = this.switchers.find(p => p.id === id)
  if (!switcher) {
    window.parent.postMessage({
      source: 'simulator-script',
      type: 'Error',
      func: 'show',
      payload: {message: `Switcher with ID: ${id} not found`}
    }, '*');
    throw new Error()
  }
  return switcher
}

Switchers.prototype.getByName = function (name) {
  console.log('Switcher getByName')
  let switcher = this.switchers.find(p => p.name === name)
  if (!switcher) {
    window.parent.postMessage({
      source: 'simulator-script',
      type: 'Error',
      func: 'show',
      payload: {message: `Switcher with name: ${name} not found`}
    }, '*');
    throw new Error()
  }
  return switcher
}

export function Switcher(switcherData) {
  this.id = switcherData.id
  this.direction = switcherData.currentState
  this.onDirectionChangeCallback = null
}

Switcher.prototype.setDirection = function (direction) {
  let payload = {id: this.id, direction: direction}
  // notify to editor
  window.parent.postMessage({
    source: 'simulator-script',
    type: 'Switcher',
    func: 'setDirection',
    payload: payload
  }, '*');
  this.direction = direction
}

Switcher.prototype.onDirectionChange = function (callback) {
  this.onDirectionChangeCallback = callback
}

Switcher.prototype._updateDirection = function (direction) {
  if (this.direction !== direction && this.onDirectionChangeCallback) {
    this.onDirectionChangeCallback(direction)
  }
  this.direction = direction
}
