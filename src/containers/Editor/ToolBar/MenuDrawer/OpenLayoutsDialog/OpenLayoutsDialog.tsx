import * as React from 'react'
import {DialogContent, DialogTitle} from '@material-ui/core'
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import LayoutAPI from "apis/layout"
import getLogger from "logging";
import {getLayoutImageFileName} from "apis/storage";
import {LayoutCard} from "containers/Editor/ToolBar/MenuDrawer/OpenLayoutsDialog/LayoutCard/LayoutCard";
import {LayoutMeta} from "stores/layoutStore";
import Grid from "@material-ui/core/Grid";
import {ConfirmationDialog} from "containers/Editor/Palettes/BuilderPalettes/LayerPalette/ConfirmationDialog/ConfirmationDialog";
import {UserInfo} from "containers/common/Authenticator/AuthPiece/AuthPiece";

const LOGGER = getLogger(__filename)

export interface OpenLayoutDialogProps {
  open: boolean
  onClose: () => void

  layouts: LayoutMeta[]
  userInfo: UserInfo
  loadLayout: (layoutId: string) => void
  loadLayoutList: () => void
}

export interface OpenLayoutDialogState {
  deleteDialogOpen: boolean
  targetLayoutId: string
}


export default class OpenLayoutsDialog extends React.Component<OpenLayoutDialogProps, OpenLayoutDialogState> {

  constructor(props: OpenLayoutDialogProps) {
    super(props)

    this.state = {
      deleteDialogOpen: false,
      targetLayoutId: null
    }
  }

  onEnter = () => {
    this.props.loadLayoutList()
  }

  deleteLayout = (layoutId) => async () => {
    await LayoutAPI.deleteLayoutData(this.props.userInfo.id, layoutId)
    await this.props.loadLayoutList()
  }


  onClick = (meta: LayoutMeta) => async (e) => {
    this.props.loadLayout(meta.id)
    this.props.onClose()
  }


  openDeleteDialog = (layoutId: string) => (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      deleteDialogOpen: true,
      targetLayoutId: layoutId
    })
  }

  closeDeleteDialog = () => {
    this.setState({
      deleteDialogOpen: false,
      targetLayoutId: null
    })
  }

  renderLayoutCards = () => {
    const sortedLayouts = this.props.layouts.sort((a, b) => b.lastModified - a.lastModified)
    if (sortedLayouts.length == 0) {
      return null
    }

    return (
      <Grid container spacing={4}>
        {sortedLayouts.map((meta, idx) => {
          const layoutImageFile = getLayoutImageFileName(this.props.userInfo.id, meta.id)
          return (
            <Grid key={`open-layout-dialog-grid-${idx}`} item xs={4}>
              <LayoutCard
                key={`open-layout-dialog-card-${idx}`}
                imgKey={layoutImageFile}
                title={meta.name}
                lastModified={meta.lastModified}
                onClick={this.onClick(meta)}
                onDelete={this.openDeleteDialog(meta.id)}
                onRename={this.openDeleteDialog(meta.id)}
              />
            </Grid>
          )
        })}
      </Grid>
    )
  }

  render() {
    let layoutName = ''
    if (this.state.targetLayoutId) {
      layoutName = this.props.layouts.find(layout => layout.id === this.state.targetLayoutId).name
    }

    return (
      <Dialog
        open={this.props.open}
        onEnter={this.onEnter}
        onClose={this.props.onClose}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle>{"My Layouts"}</DialogTitle>
        <DialogContent>
          <Typography>
            You have {this.props.layouts.length} layouts.
          </Typography>
          {this.renderLayoutCards()}
        </DialogContent>
        <ConfirmationDialog
          title={'Delete Layout'}
          text={`Are you OK to delete layout "${layoutName}"? \nThis action cannot be reverted.`}
          open={this.state.deleteDialogOpen}
          onOK={this.deleteLayout(this.state.targetLayoutId)}
          onClose={this.closeDeleteDialog}
        />
      </Dialog>
    )
  }
}


