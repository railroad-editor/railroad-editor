import * as React from 'react';
import {Auth, Logger} from 'aws-amplify';
import AuthPiece, {AuthState} from "components/common/Authenticator/AuthPiece/AuthPiece";
import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {DialogTitle} from "material-ui";
import {ErrorMessageGrid, MainButtonGrid, StyledDialogContent} from "components/common/Authenticator/styles";

const logger = new Logger('ForgotPassword');


export default class ForgotPassword extends AuthPiece<any, any> {

  constructor(props) {
    super(props);

    this._validAuthStates = [AuthState.FORGOT_PASSWORD]
    this.state = {
      inputs: {},
      disabled: true,
      delivery: null
    }
  }


  sendEmail = () => {
    const { email } = this.state.inputs;
    Auth.forgotPassword(email)
      .then(data => this.changeState(AuthState.CONFIRM_FORGOT_PASSWORD, null))
      .catch(err => this.error(err));
  }

  onKeyPress = (e) => {
    if ( (! this.state.disabled) && e.key === 'Enter') {
      this.sendEmail()
      e.preventDefault()
    }
  }


  showComponent() {
    return (
      <div>
        <DialogTitle>Password Reset</DialogTitle>
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
              </ValidatorForm>
            </Grid>
          </Grid>
          <MainButtonGrid item xs={12}>
            <Button fullWidth variant="raised" color="primary"
                    disabled={this.state.disabled} onClick={this.sendEmail}>
              Send Email
            </Button>
          </MainButtonGrid>
          <Grid item xs={12}>
            <Button onClick={() => this.changeState(AuthState.SIGN_IN)}>
              Back to Sign In
            </Button>
          </Grid>
          <ErrorMessageGrid item xs={12}>
            {this.props.errorMessage}
          </ErrorMessageGrid>
        </StyledDialogContent>
      </div>
    )
  }
}
