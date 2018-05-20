import * as React from 'react'
import {TypographyProps} from "material-ui/Typography";
import {inject, observer} from "mobx-react";
import {STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {LayoutStore} from "store/layoutStore";
import EditDialog from "components/common/EditableTypography/EditDialog/EditDialog";
import {StyledTypography} from "components/common/EditableTypography/styles";

export interface EditableTitleProps extends TypographyProps {
  onOK: (text: string) => void
  text: string
  common?: CommonStore
  layout?: LayoutStore
}

export interface EditableTitleState {
  text: string
  openDialog: boolean
}


@inject(STORE_COMMON, STORE_LAYOUT)
@observer
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
    const {onOK, text, common, layout, ...restProps} = this.props
    return (
      <>
        <StyledTypography onClick={this.openDialog} {...restProps}>
          {this.props.text}
        </StyledTypography>
        <EditDialog
          open={this.state.openDialog}
          title={'Layout Name'}
          text={this.state.text}
          onOK={this.onOK}
          onClose={this.closeDialog}
        />
      </>
    )
  }
}


