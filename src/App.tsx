import * as React from 'react'
import Editor from 'containers/Editor/Editor'
import {BrowserRouter as Router, Route} from "react-router-dom";
import {Redirect} from "react-router";
import * as qs from "query-string"
import Amplify, {Auth} from "aws-amplify";
import aws_exports from './aws-exports';
import ResetPassword from "containers/common/Authenticator/ResetPassword/ResetPassword";
import {inject, observer} from "mobx-react";
import {STORE_EDITOR, STORE_UI} from "constants/stores";
import {EditorStore} from "store/editorStore";
import withRoot from './withRoot';
import getLogger from "logging";
import 'typeface-roboto'
import './App.css'
import Home from "./containers/Home/Home";
import {Helmet} from "react-helmet";
import {UiStore} from "./store/uiStore";
import {Snackbar} from "./components/Snackbar/Snackbar";

(window as any).LOG_LEVEL = 'DEBUG';

Amplify.configure(aws_exports)

const LOGGER = getLogger(__filename)


export interface AppProps {
  editor: EditorStore
  ui?: UiStore
}


@inject(STORE_EDITOR, STORE_UI)
@observer
class App extends React.Component<AppProps, {}> {

  constructor(props: any) {
    super(props)
  }

  componentDidMount(): void {
    const params = qs.parse((window as any).location.search)
    if (params.confirmed === 'true') {
      this.props.ui.setConfirmedSnackbar(true)
    }
  }

  async componentWillMount() {
    // セッションストレージからユーザー情報を取り出す
    const session = await Auth.currentSession()
    const userInfo = await Auth.currentUserInfo()
    if (userInfo) {
      LOGGER.info('Signed in as', userInfo) //`
      this.props.editor.setUserInfo(userInfo)
    }
  }

  closeConfirmedSnackbar = () => {
    this.props.ui.setConfirmedSnackbar(false)
  }

  render() {
    console.log(process.env)
    return (
      <div id="app" className='App'>
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
        <Snackbar open={this.props.ui.confirmedSnackbar}
                  onClose={this.closeConfirmedSnackbar}
                  message={'Confirmed successfully. Please login from Menu.'}
                  variant="success"
        />
      </div>
    )
  }
}

export default withRoot(App);
