import * as React from 'react';
import {ReactElement, ReactNode} from 'react';
import Amplify, {Logger} from 'aws-amplify';
// import RequireNewPassword from './RequireNewPassword';
// import ConfirmSignUp from './ConfirmSignUp';
// import VerifyContact from './VerifyContact';
// import ForgotPassword from './ForgotPassword';
// import TOTPSetup from './TOTPSetup';
import AmplifyMessageMap from './AmplifyMessageMap';
import {AuthState} from "components/common/Authenticator/AuthPiece/AuthPiece";
import SignIn from "components/common/Authenticator/SignIn/SignIn";
import SignUp from "components/common/Authenticator/SignUp/SignUp";
import ForgotPassword from "components/common/Authenticator/ForgotPassword/ForgotPassword";
import ConfirmEmail from "components/common/Authenticator/ConfirmEmail/ConfirmEmail";


const logger = new Logger('Authenticator');

export interface AuthenticatorProps {
  authState?: AuthState
  onStateChange?: (state: AuthState, data: any) => void
  errorMessage?: any
  amplifyConfig?: any
  errorRenderer?: (err: any) => ReactNode
  federated?: any
}

export interface AuthenticatorState {
  auth: AuthState
  authData: any
  error: any
}


export default class Authenticator extends React.Component<AuthenticatorProps, AuthenticatorState> {
  constructor(props: AuthenticatorProps) {
    super(props);

    this.handleStateChange = this.handleStateChange.bind(this);
    this.handleAuthEvent = this.handleAuthEvent.bind(this);

    this.state = {
      auth: props.authState || AuthState.SIGN_IN,
      authData: null,
      error: null
    };
  }

  componentWillMount() {
    const config = this.props.amplifyConfig;
    if (config) {
      Amplify.configure(config);
    }
  }

  handleStateChange(state, data) {
    logger.debug('authenticator state change ' + state, data);
    if (state === this.state.auth) {
      return;
    }

    if (state === AuthState.SIGNED_OUT) {
      state = AuthState.SIGN_IN
    }
    this.setState({
      auth: state,
      authData: data,
      error: null
    });
    if (this.props.onStateChange) {
      this.props.onStateChange(state, data)
    }
  }

  handleAuthEvent(state, event) {
    if (event.type === 'error') {
      const map = this.props.errorMessage || AmplifyMessageMap;
      const message = (typeof map === 'string') ? map : map(event.data);
      this.setState({error: message});
    }
  }

  render() {
    const {auth, authData} = this.state;
    const messageMap = this.props.errorMessage

    let {federated} = this.props;
    const props_children = this.props.children || [];
    const default_children = [
      <SignIn federated={federated}/>,
      <SignUp/>,
      <ForgotPassword/>,
      <ConfirmEmail
        title="Sign Up"
        validAuthStates={[AuthState.CONFIRM_SIGN_UP]}
      />,
      <ConfirmEmail
        title="Password Reset"
        validAuthStates={[AuthState.CONFIRM_FORGOT_PASSWORD]}
      />
    ];

    const render_props_children = React.Children.map(props_children, (child, index) => {
      return React.cloneElement(child as ReactElement<any>, {
        key: 'aws-amplify-authenticator-props-children-' + index,
        messageMap: messageMap,
        authState: auth,
        authData: authData,
        onStateChange: this.handleStateChange,
        onAuthEvent: this.handleAuthEvent,
        errorMessage: this.state.error,
      });
    });

    const render_default_children = React.Children.map(default_children, (child, index) => {
      return React.cloneElement(child as ReactElement<any>, {
        key: 'aws-amplify-authenticator-default-children-' + index,
        messageMap: messageMap,
        authState: auth,
        authData: authData,
        onStateChange: this.handleStateChange,
        onAuthEvent: this.handleAuthEvent,
        errorMessage: this.state.error,
      });
    });

    const render_children = render_default_children.concat(render_props_children);

    return (
      <div>
        {render_children}
      </div>
    )
  }
}
