import * as React from 'react'
import Editor from 'components/Editor/Editor'
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Redirect} from "react-router";
import qs from "query-string"
import Amplify from "aws-amplify";
import Auth from "aws-amplify/lib/Auth";
import aws_exports from './aws-exports';
import ResetPassword from "components/common/Authenticator/ResetPassword/ResetPassword";
import {inject, observer} from "mobx-react";
import {STORE_COMMON} from "constants/stores";
import {CommonStore} from "store/commonStore";
import withRoot from './withRoot';
import getLogger from "logging";
import 'typeface-roboto'
import './App.css'
import Home from "./components/Home/Home";
import {Helmet} from "react-helmet";


const API_ENDPOINTS = {
  beta: "https://foo866bgvk.execute-api.ap-northeast-1.amazonaws.com/beta",
  prod: "https://foo866bgvk.execute-api.ap-northeast-1.amazonaws.com/prod",
}

aws_exports.aws_cloud_logic_custom[0].endpoint = API_ENDPOINTS[process.env.REACT_APP_ENV]
aws_exports.aws_cloud_logic_custom[0].custom_header = async () => {
  console.log('api', process.env.REACT_APP_AWS_API_KEY)
  return {'x-api-key': process.env.REACT_APP_AWS_API_KEY}
}

console.log('api', process.env.REACT_APP_AWS_API_KEY)

Amplify.configure(aws_exports)

const LOGGER = getLogger(__filename)


export interface AppProps {
  common?: CommonStore
}


@inject(STORE_COMMON)
@observer
class App extends React.Component<AppProps, {}> {

  constructor(props: any) {
    super(props)
  }

  async componentWillMount() {
    // セッションストレージからユーザー情報を取り出す
    const session = await Auth.currentSession()
    const userInfo = await Auth.currentUserInfo()
    if (userInfo) {
      LOGGER.info(`UserInfo: ${userInfo}`)
      this.props.common.setAuthData(userInfo)
    }
  }


  render() {
    console.log(process.env)
    return (
      <div className='App'>
        <Helmet>
          <meta charSet="utf-8"/>
          <title>Railroad Editor (Beta)</title>
        </Helmet>
        <Router>
          <div>
            <Route exact path="/" render={() => <Home/>}/>
            <Route path="/editor" render={() => <Editor width={6000} height={4000}/>}/>
            <Route path="/reset-password" render={({location, ...rest}) => {
              const params = qs.parse(location.search)
              if (params.user_name && params.confirmation_code) {
                return <ResetPassword userName={params.user_name} code={params.confirmation_code}/>
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

export default withRoot(App);
