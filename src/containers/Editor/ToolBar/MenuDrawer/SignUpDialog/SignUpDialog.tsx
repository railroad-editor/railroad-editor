import * as React from 'react'
import Dialog from "@material-ui/core/Dialog";
import AuthWrapper from "containers/common/AuthWrapper/AuthWrapper";
import {AuthState, UserInfo} from "containers/common/Authenticator/AuthPiece/AuthPiece";
import {inject, observer} from "mobx-react";
import {STORE_UI} from "../../../../../constants/stores";
import {UiStore} from "../../../../../store/uiStore";


export interface SignUpDialogProps {
  open: boolean
  onClose: () => void
  setAuthData: (authData: UserInfo) => void
  loadLayoutList: () => void
  ui?: UiStore
}


@inject(STORE_UI)
@observer
export default class SignUpDialog extends React.Component<SignUpDialogProps, {}> {

  constructor(props: SignUpDialogProps) {
    super(props)

    this.onSignedIn = this.onSignedIn.bind(this)
  }

  onSignedIn = () => {
    this.props.ui.setLoggedInSnackbar(true)
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

