import * as React from "react";

export interface AuthData {
  username: string
}

export interface AuthPieceProps {
  // authData: AuthData
  authState?: any
  onAuthEvent?: any
  onStateChange?: (state: string, data: any) => void
  errorMessage?: string
}

export interface AuthPieceState {
  inputs: InputData
  disabled: boolean
}

interface InputData {
  [key: string]: string
}

export enum AuthState {
  SIGN_UP = 'signUp',
  CONFIRM_EMAIL = 'confirmSignUp',
  SIGNED_UP = 'signedUp',
  SIGN_IN = 'signIn',
  CONFIRM_SIGNIN = 'confirmSignIn',
  SIGNED_IN = 'signedIn',
  SIGNED_OUT = 'signedOut',
  VERIFY_CONTACT = 'verifyContact',
  FORGOT_PASSWORD = 'forgotPassword',
  REQUIRE_NEW_PASSWORD = 'requireNewPassword',
  TOTP_SETUP = 'TOTPSetup',
}


export default abstract class AuthPiece<P extends AuthPieceProps, S extends AuthPieceState> extends React.Component<P, S> {

  _form: any
  _isHidden: boolean
  _validAuthStates: any[]

  constructor(props: P) {
    super(props);

    this._form = null
    this._isHidden = true;
    this._validAuthStates = [];
    this.changeState = this.changeState.bind(this);
    this.error = this.error.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  // extract username from authData
  // usernameFromAuthData() {
  //   const { authData } = this.props;
  //   if (!authData) { return ''; }
  //
  //   let username = '';
  //   if (typeof authData === 'object') { // user object
  //     username = authData.user? authData.user.username : authData.username;
  //   } else {
  //     username = authData; // username string
  //   }
  //
  //   return username;
  // }

  errorMessage(err: string|any) {
    if (typeof err === 'string') { return err; }
    return err.message? err.message : JSON.stringify(err);
  }

  triggerAuthEvent(event) {
    const state = this.props.authState;
    if (this.props.onAuthEvent) { this.props.onAuthEvent(state, event); }
  }

  changeState(state: AuthState, data?: any) {
    if (this.props.onStateChange) { this.props.onStateChange(state, data); }

    this.triggerAuthEvent({
      type: 'stateChange',
      data: state
    });
  }

  error(err) {
    this.triggerAuthEvent({
      type: 'error',
      data: this.errorMessage(err)
    });
  }

  handleInputChange = (evt) => {
    const { name, value, type, checked } = evt.target;
    const check_type = ['radio', 'checkbox'].includes(type);
    this.setState({
      inputs: {
        ...this.state.inputs as any,
        [name]: check_type ? checked : value
      }
    })
  }

  handleValidation = () => {
    this.setState({
      disabled: ! (this._form && this._form.isFormValid())
    })
  }

  render() {
    if (!this._validAuthStates.includes(this.props.authState)) {
      this._isHidden = true;
      return null;
    }
    this._isHidden = false;

    return this.showComponent();
  }

  showComponent() {
    return null
  }
}
