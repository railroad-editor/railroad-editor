import * as React from 'react'
import Dialog from "material-ui/Dialog";
import AuthWrapper from "components/common/AuthWrapper/index";
import {AuthState} from "components/common/Authenticator/AuthPiece/AuthPiece";


export interface LoginDialogProps {
  open: boolean
  onClose: () => void

  snackbar: any
}


export class LoginDialog extends React.Component<LoginDialogProps, {}> {

  constructor(props: LoginDialogProps) {
    super(props)

    this.onClose = this.onClose.bind(this)
    this.onSignedIn = this.onSignedIn.bind(this)
  }

  onClose() {
    if (this.props.onClose) {
      this.props.onClose()
    }
  }

  onSignedIn() {
    this.props.snackbar.showMessage('Logged-in successfully!')
    this.onClose()
  }

  render() {
    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose}
      >
        <AuthWrapper onSignedIn={this.onSignedIn} authState={AuthState.SIGN_IN} />
      </Dialog>
    )
  }
}

