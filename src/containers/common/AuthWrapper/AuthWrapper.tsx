import * as React from "react";
// import {Authenticator} from "aws-amplify-react";
import getLogger from "logging";
import Authenticator from "containers/common/Authenticator/Authenticator";
import {AuthState} from "containers/common/Authenticator/AuthPiece/AuthPiece";
import {Auth} from "aws-amplify";

const LOGGER = getLogger(__filename)

const FEDERATED = {
  google_client_id: '658362738764-9kdasvdsndig5tsp38u7ra31fu0e7l5t.apps.googleusercontent.com',
  facebook_app_id: '154268202060246'
};


export interface AuthWrapperProps {
  authState: AuthState
  setAuthData: (object) => void
  onSignedIn: (object) => void
  onSignedOut?: (object) => void
}

export default class AuthWrapper extends React.Component<AuthWrapperProps, {}> {

  constructor(props: AuthWrapperProps) {
    super(props)
  }

  onStateChange = async (state, data) => {
    if (state == 'signedIn' && this.props.onSignedIn) {
      const userInfo = await Auth.currentUserInfo()
      this.props.setAuthData(userInfo)
      this.props.onSignedIn(userInfo)
      LOGGER.info('Signed in as', userInfo) //`
    }
  }

  render() {
    return (
      <Authenticator
        federated={FEDERATED}
        onStateChange={this.onStateChange}
        authState={this.props.authState}
      />
    )
  }
}


