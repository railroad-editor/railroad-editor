import * as React from 'react';
import {Logger} from 'aws-amplify';
import AuthPiece, {AuthState} from "components/common/Authenticator/AuthPiece/AuthPiece";
import Grid from "material-ui/Grid";
import Button from "material-ui/Button";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import Typography from "material-ui/Typography";
import {DialogTitle} from "material-ui";
import {StyledDialogContent} from "components/common/Authenticator/styles";

const logger = new Logger('ForgotPassword');


export default class ConfirmEmail extends AuthPiece<any, any> {

  constructor(props) {
    super(props);

    this._validAuthStates = [AuthState.CONFIRM_EMAIL]
    this.state = {
      inputs: {},
      disabled: true,
    }
  }

  showComponent() {
    return (
      <div>
        <DialogTitle>Password Reset</DialogTitle>
        <StyledDialogContent>
          <Grid container spacing={8}>
            <Grid item xs={12} style={{margin: '16px 0px 16px 0px'}}>
              <Typography>
                Please open the sent email and follow the link.
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12} style={{margin: '16px 0px 16px 0px'}}>
            <Button onClick={() => this.changeState(AuthState.SIGN_IN)}>
              Back to Sign In
            </Button>
          </Grid>
        </StyledDialogContent>
      </div>
    )
  }
}
