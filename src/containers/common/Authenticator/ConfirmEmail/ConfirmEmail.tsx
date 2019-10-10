import * as React from 'react';
import AuthPiece, {AuthPieceProps, AuthState} from "containers/common/Authenticator/AuthPiece/AuthPiece";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {DialogTitle} from '@material-ui/core';
import {StyledDialogContent} from "containers/common/Authenticator/styles";


export interface ConfirmEmailProps extends AuthPieceProps {
  title: string
  validAuthStates: AuthState[]
}


export default class ConfirmEmail extends AuthPiece<ConfirmEmailProps, any> {

  constructor(props) {
    super(props);

    this._validAuthStates = this.props.validAuthStates
    this.state = {
      inputs: {},
      disabled: true,
    }
  }

  showComponent() {
    return (
      <div>
        <DialogTitle>{this.props.title}</DialogTitle>
        <StyledDialogContent>
          <Grid container spacing={1}>
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
