import * as React from "react";
import {TextValidator} from 'react-material-ui-form-validator';


/**
 * 自身にオートフォーカスする TextField
 */
export default class AutoFocusTextValidator extends React.Component<any, {}> {

  render() {
    const delay = this.props.delay ? this.props.delay : 250
    return (
      <TextValidator
        {...this.props}
        inputRef={(input) => {
          if (input) setTimeout(() => input.focus(), delay)
        }}
      >
      </TextValidator>
    )
  }
}

