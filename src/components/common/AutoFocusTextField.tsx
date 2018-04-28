import * as React from "react";
import TextField from "material-ui/TextField";

/**
 * 自身にオートフォーカスする TextField
 */
export default class AutoFocusTextField extends React.Component<any, {}> {

  render() {
    const delay = this.props.delay ? this.props.delay : 250
    return (
      <TextField
        {...this.props}
        inputRef={(input) => { if (input) setTimeout(() => input.focus(), delay)}}
      >
      </TextField>
    )
  }
}

