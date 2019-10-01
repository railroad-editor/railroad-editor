import * as React from 'react';
import {Auth} from 'aws-amplify';
import AuthPiece, {
  AuthPieceProps,
  AuthPieceState,
  AuthState
} from "containers/common/Authenticator/AuthPiece/AuthPiece";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {CenteredGrid} from "containers/common/Authenticator/ResetPassword/styles";
import Typography from "@material-ui/core/Typography";
import {RouteComponentProps, withRouter} from "react-router";
import {DialogTitle} from '@material-ui/core';

// const logger = new Logger('ResetPassword');

interface ResetPasswordProps extends AuthPieceProps, RouteComponentProps {
  code: string
  userName: string
}

interface ResetPasswordState extends AuthPieceState {
  success: boolean
}


export class ResetPassword extends AuthPiece<ResetPasswordProps, ResetPasswordState> {
  public static defaultProps: Partial<ResetPasswordProps> = {
    authState: AuthState.FORGOT_PASSWORD
  }


  constructor(props) {
    super(props);

    this._form = null
    this._validAuthStates = [AuthState.FORGOT_PASSWORD]
    this.state = {
      inputs: {},
      disabled: true,
      success: false
    }
  }

  componentWillMount() {
    // custom rule will have name 'isPasswordMatch'
    ValidatorForm.addValidationRule('isPasswordMatch', (value) => value === this.state.inputs.password);
  }

  submit = () => {
    const {code, userName} = this.props
    const {password} = this.state.inputs
    Auth.forgotPasswordSubmit(userName, code, password)
      .then(data => {
        this.setState({success: true})
        setTimeout(() => {
          this.props.history.push('/')
        }, 5000)
      })
      .catch(err => this.error(err));
  }

  onKeyPress = (e) => {
    if ((! this.state.disabled) && e.key === 'Enter') {
      this.submit()
      e.preventDefault()
    }
  }

  successView = () => {
    return (
      <div>
        <CenteredGrid container>
          <Grid item xs={12}>
            <Typography>Reset password successfully!</Typography>
            <Typography>Automatically jump to editor after 5 sec.</Typography>
          </Grid>
        </CenteredGrid>
      </div>
    )
  }

  inputView = () => {
    return (
      <div>
        <DialogTitle>Reset Password</DialogTitle>
        <CenteredGrid container>
          <Grid item xs={12}>
            <ValidatorForm
              ref={this.getFormRef}
            >
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
              <br/>
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
        </CenteredGrid>
        <CenteredGrid container spacing={1} style={{marginTop: '16px'}}>
          <Grid item xs={12}>
            <Button color="primary"
                    disabled={this.state.disabled} onClick={this.submit}>
              Change Password
            </Button>
          </Grid>
        </CenteredGrid>
      </div>
    )
  }


  showComponent() {
    return (
      <div>
        {this.state.success ? this.successView() : this.inputView()}
      </div>
    )
  }
}


export default withRouter(ResetPassword) as any
