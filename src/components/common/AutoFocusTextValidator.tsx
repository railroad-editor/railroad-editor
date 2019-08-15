import * as React from "react";
import {TextValidator} from 'react-material-ui-form-validator';


/**
 * 自身にオートフォーカスする TextField
 */
export default class AutoFocusTextValidator extends React.Component<any, {}> {

  input: any

  render() {
    const delay = this.props.delay ? this.props.delay : 250
    return (
      <TextValidator
        {...this.props}
        inputRef={(input) => {
          // マウント直後の一回のみ実行
          if (input && ! this.input) {
            this.input = input
            setTimeout(() => this.input.focus(), delay)
          }
        }}
      >
      </TextValidator>
    )
  }
}

