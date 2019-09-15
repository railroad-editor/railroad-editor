import * as React from 'react'
import {TypographyProps} from "@material-ui/core/Typography";
import EditDialog from "containers/common/EditableTypography/EditDialog/EditDialog";
import {StyledTypography} from "containers/common/EditableTypography/styles";

export interface EditableTitleProps extends TypographyProps {
  onOK: (text: string) => void
  text: string
}

export interface EditableTitleState {
  text: string
  openDialog: boolean
}


export class EditableTypography extends React.Component<EditableTitleProps, EditableTitleState> {

  constructor(props: EditableTitleProps) {
    super(props)
    this.state = {
      text: this.props.text,
      openDialog: false
    }
  }

  openDialog = (e) => {
    this.setState({
      openDialog: true
    })
  }

  closeDialog = () => {
    this.setState({
      openDialog: false
    })
  }

  onOK = (text: string) => {
    this.setState({
      text: text
    })
    this.props.onOK(text)
  }

  render() {
    const {onOK, text, ...restProps} = this.props
    return (
      <>
        <StyledTypography onClick={this.openDialog} {...restProps}>
          {this.props.text}
        </StyledTypography>
        <EditDialog
          open={this.state.openDialog}
          title={'Layout Name'}
          text={this.props.text}
          onOK={this.onOK}
          onClose={this.closeDialog}
        />
      </>
    )
  }
}


