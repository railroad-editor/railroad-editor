import * as React from "react";
import {Auth, JS, Logger} from 'aws-amplify';

import {Button, DialogTitle, Grid} from "material-ui";
import AuthPiece, {
  AuthPieceProps,
  AuthPieceState,
  AuthState
} from "components/common/Authenticator/AuthPiece/AuthPiece";
// import { FederatedButtons } from './FederatedSignIn';
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {ErrorMessageGrid, MainButtonGrid, StyledDialogContent} from "components/common/Authenticator/styles";

const logger = new Logger('SignIn');


export interface SignInProps extends AuthPieceProps {
  federated: any
}


export default class SignIn extends AuthPiece<SignInProps, AuthPieceState> {

  constructor(props) {
    super(props);
    this.state = {
      inputs: {},
      disabled: true,
    }

    this._validAuthStates = [AuthState.SIGN_IN, AuthState.SIGNED_OUT, AuthState.SIGNED_UP];
    this.checkContact = this.checkContact.bind(this);
    this.signIn = this.signIn.bind(this);

  }

  checkContact = (user) => {
    Auth.verifiedContact(user)
      .then(data => {
        if (!JS.isEmpty(data.verified)) {
          this.changeState(AuthState.SIGNED_IN, user);
        } else {
          user = Object.assign(user, data);
          this.changeState(AuthState.VERIFY_CONTACT, user);
        }
      });
  }

  signIn = () => {
    const { email, password } = this.state.inputs;
    Auth.signIn(email, password)
      .then(user => {
        logger.debug(user);
        if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
          logger.debug('confirm user with ' + user.challengeName);
          this.changeState(AuthState.CONFIRM_SIGNIN, user);
        } else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          logger.debug('require new password', user.challengeParam);
          this.changeState(AuthState.REQUIRE_NEW_PASSWORD, user);
        } else if (user.challengeName === 'MFA_SETUP') {
          logger.debug('TOTP setup', user.challengeParam);
          this.changeState(AuthState.TOTP_SETUP, user);
        }
        else {
          this.checkContact(user);
        }
      })
      .catch(err => {
        this.error(err)
      });
  }


  showComponent() {
    const { authState, federated, onStateChange } = this.props;

    return (
      <div>
        <DialogTitle>Login</DialogTitle>
        <StyledDialogContent>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <ValidatorForm
                ref={(form) => this._form = form}
              >
                <TextValidator
                  autoFocus
                  label="Email"
                  name="email"
                  key="email"
                  value={this.state.inputs.email}
                  onChange={this.handleInputChange}
                  validatorListener={this.handleValidation}
                  validators={['required', 'isEmail']}
                  errorMessages={['this field is required', 'email is not valid']}
                  fullWidth
                />
                <br />
                <TextValidator
                  label="Password"
                  name="password"
                  key="password"
                  type="password"
                  value={this.state.inputs.password}
                  onChange={this.handleInputChange}
                  validatorListener={this.handleValidation}
                  validators={['required']}
                  errorMessages={['this field is required']}
                  fullWidth
                />
              </ValidatorForm>
            </Grid>
            <MainButtonGrid item xs={12}>
              <Button fullWidth variant="raised" color="primary"
                      disabled={this.state.disabled} onClick={this.signIn}>
                Login
              </Button>
            </MainButtonGrid>
            <Grid item xs={12}>
              <Button onClick={() => this.changeState(AuthState.FORGOT_PASSWORD)}>
                I forgot my password
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button onClick={() => this.changeState(AuthState.SIGN_UP)}>
                I want to create new account
              </Button>
            </Grid>
            <ErrorMessageGrid item xs={12}>
              {this.props.errorMessage}
            </ErrorMessageGrid>
          </Grid>
        </StyledDialogContent>
      </div>
  )
  }
  }
