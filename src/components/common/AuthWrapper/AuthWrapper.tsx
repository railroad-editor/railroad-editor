import * as React from "react";
// import {Authenticator} from "aws-amplify-react";
import getLogger from "logging";
import Authenticator from "components/common/Authenticator/Authenticator";
import {AuthState} from "components/common/Authenticator/AuthPiece/AuthPiece";

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
    this.onStateChange = this.onStateChange.bind(this)
  }

  onStateChange(state, data) {
    this.props.setAuthData(data)
    if (state == 'signedIn' && this.props.onSignedIn) {
      LOGGER.info(data) //`
      this.props.onSignedIn(data)
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


