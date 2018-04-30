import * as React from 'react'
import Editor from 'components/Editor/Editor'

import './App.css'

import {BrowserRouter as Router, Route} from "react-router-dom";
import {StyleRulesCallback, WithStyles} from 'material-ui/styles'
import withStyles from "material-ui/styles/withStyles";
import withRoot from './withRoot';
import Amplify from "aws-amplify";
import aws_exports from './aws-exports';
import TestCases from "./components/cases/TestCases";
import 'typeface-roboto'
import ResetPassword from "components/common/Authenticator/ResetPassword/ResetPassword";
import qs from "query-string"
import {Redirect} from "react-router";

const API_ENDPOINTS = {
  dev: "https://foo866bgvk.execute-api.ap-northeast-1.amazonaws.com/dev",
  beta: "https://foo866bgvk.execute-api.ap-northeast-1.amazonaws.com/beta",
  prod: "https://foo866bgvk.execute-api.ap-northeast-1.amazonaws.com/prod",
}
aws_exports.aws_cloud_logic_custom[0].endpoint = API_ENDPOINTS[process.env.REACT_APP_ENV]

Amplify.configure(aws_exports)



const muiStyles: StyleRulesCallback<'root'> = theme => ({
  root: {
    textAlign: 'center',
    paddingTop: theme.spacing.unit * 20,
  },
});

class App extends React.Component<WithStyles<'root'>, {}> {
  private _request: any;

  constructor(props: any) {
    super(props)
    this.state = {
      imageSize: 720,
      mounted: false,
    }
    this._request = null
  }

  resizeWindow = () => {
    this._request = requestAnimationFrame(this.resizePaper)
  }

  resizePaper = () => {
    this.forceUpdate()
    this._request = null
  }

  componentDidMount() {
    this.setState({ mounted: true })
    window.addEventListener('resize', this.resizeWindow)
  }

  componentWillUnmount() {
    if (this._request) {
      cancelAnimationFrame(this._request)
      this._request = null
    }
    window.removeEventListener('resize', this.resizeWindow)
  }

  // コンテキストメニュー無効
  render() {
    console.log(process.env)
    return (
      <div className='App'
           onContextMenu={(e) => {
             e.preventDefault()
             return false;
           }}
      >
        <Router>
          <div>
            <Route exact path="/" render={() => <Editor width={6000} height={4000} /> }/>
            <Route path="/reset-password" render={({location, ...rest}) => {
              const params =qs.parse(location.search)
              if (params.user_name && params.confirmation_code) {
                return <ResetPassword userName={params.user_name} code={params.confirmation_code} />
              } else {
                return <Redirect push to={"/"} />
              }
            }}
            />
            <Route path="/tests" render={() => {
              if (process.env.NODE_ENV === 'development') {
                return <TestCases/>
              } else {
                return <Redirect push to={"/"}/>
              }
            }}
            />
          </div>
        </Router>
      </div>
    )
  }
}

export default withRoot(withStyles(muiStyles)<{}>(App));
