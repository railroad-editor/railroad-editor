import * as React from "react";
import {Auth} from 'aws-amplify';

import AuthPiece, {
  AuthPieceProps,
  AuthPieceState,
  AuthState
} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {Button, DialogTitle, Grid} from "material-ui";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {ErrorMessageGrid, MainButtonGrid, StyledDialogContent} from "components/common/Authenticator/styles";

export interface SignUpProps {
}

export interface SignUpState extends AuthPieceState {
  disabled: boolean
}


export default class SignUp extends AuthPiece<AuthPieceProps, SignUpState> {

  constructor(props) {
    super(props);
    this.state = {
      inputs: {},
      disabled: true,
    }

    this._validAuthStates = [AuthState.SIGN_UP];
    this.signUp = this.signUp.bind(this);
  }

  componentWillMount() {
    // custom rule will have name 'isPasswordMatch'
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => value === this.state.inputs.password );
  }

  signUp() {
    const { email, password } = this.state.inputs;
    Auth.signUp({
      username: email,
      password: password,
      email: email,
      attributes: {
        'custom:env': process.env.REACT_APP_ENV,
      }
    })
      .then(() => {
        this.changeState(AuthState.CONFIRM_SIGN_UP, email)

      })
      .catch(err => this.error(err));
  }

  onKeyPress = (e) => {
    if ( (! this.state.disabled) && e.key === 'Enter') {
      this.signUp()
      e.preventDefault()
    }
  }


  showComponent() {
    return (
      <div>
        <DialogTitle>Sign Up</DialogTitle>
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
                  onKeyPress={this.onKeyPress}
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
                  onKeyPress={this.onKeyPress}
                  validatorListener={this.handleValidation}
                  validators={['required']}
                  errorMessages={['this field is required']}
                  fullWidth
                />
                <br />
                <TextValidator
                  label="Confirm Password"
                  name="confirmPassword"
                  key="confirmPassword"
                  type="password"
                  value={this.state.inputs.confirmPassword}
                  onChange={this.handleInputChange}
                  onKeyPress={this.onKeyPress}
                  validatorListener={this.handleValidation}
                  validators={['isPasswordMatch', 'required']}
                  errorMessages={['password mismatch', 'this field is required']}
                  fullWidth
                />
              </ValidatorForm>
            </Grid>
            <MainButtonGrid item xs={12}>
              <Button fullWidth variant="raised" color="primary"
                      disabled={this.state.disabled} onClick={this.signUp}>
                Sign Up
              </Button>
            </MainButtonGrid>
            <Grid item xs={12}>
              <Button onClick={() => this.changeState(AuthState.SIGN_IN)}>
                Sign into an existing account
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
