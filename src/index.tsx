import * as React from 'react'
import * as ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

window.RAIL_COMPONENTS = {}
window.RAIL_GROUP_COMPONENTS = {}
window.PAPER_SCOPE = null

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
