import * as React from 'react'
import Dialog from "material-ui/Dialog";
import AuthWrapper from "components/common/AuthWrapper/AuthWrapper";
import {AuthData, AuthState} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {compose} from "recompose";


export interface SignUpDialogProps {
  open: boolean
  onClose: () => void
  setAuthData: (authData: AuthData) => void
  loadLayoutList: () => void

  snackbar?: any
}


export class SignUpDialog extends React.Component<SignUpDialogProps, {}> {

  constructor(props: SignUpDialogProps) {
    super(props)

    this.onSignedIn = this.onSignedIn.bind(this)
  }

  onSignedIn = () => {
    this.props.snackbar.showMessage('Logged-in successfully!')
    this.props.loadLayoutList()
    this.props.onClose()
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <AuthWrapper
          onSignedIn={this.onSignedIn}
          authState={AuthState.SIGN_UP}
          setAuthData={this.props.setAuthData}
        />
      </Dialog>
    )
  }
}

export default compose<SignUpDialogProps, SignUpDialogProps>(
  withSnackbar(),
)(SignUpDialog)
