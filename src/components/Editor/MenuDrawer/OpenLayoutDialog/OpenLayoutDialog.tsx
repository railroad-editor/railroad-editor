import * as React from 'react'
import {DialogContent, DialogTitle} from "material-ui"
import Dialog from "material-ui/Dialog";
import Typography from "material-ui/Typography";
import {S3Image} from 'aws-amplify-react';
import LayoutAPI from "apis/layout"
import getLogger from "logging";
import {LayoutMeta} from "reducers/layout";
import {getLayoutImageFileName} from "apis/storage";
import {LayoutCard} from "components/Editor/MenuDrawer/OpenLayoutDialog/LayoutCard/LayoutCard";
import {ConfirmationDialog} from "components/Editor/LayerPalette/ConfirmationDialog/ConfirmationDialog";

const LOGGER = getLogger(__filename)

export interface OpenLayoutDialogProps {
  open: boolean
  onClose: () => void

  layouts: LayoutMeta[]
  authData: any
  loadLayout: (layoutId: string) => void
  loadLayoutList: () => void
}

export interface OpenLayoutDialogState {
  sortedLayouts: LayoutMeta[]
  layoutImageFiles: string[]

  deleteDialogOpen: boolean
  targetLayoutId: string
}


export default class OpenLayoutDialog extends React.Component<OpenLayoutDialogProps, OpenLayoutDialogState> {

  constructor(props: OpenLayoutDialogProps) {
    super(props)

    const sortedLayouts = this.props.layouts.sort((a, b) => b.lastModified - a.lastModified)
    this.state = {
      sortedLayouts: sortedLayouts,
      layoutImageFiles: sortedLayouts.map(meta => getLayoutImageFileName(this.props.authData.username, meta.id)),
      deleteDialogOpen: false,
      targetLayoutId: null
    }

  }

  deleteLayout = (layoutId) => async () => {
    await LayoutAPI.deleteLayoutData(this.props.authData.username, layoutId)
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

  render() {
    let layoutName = ''
    if (this.state.targetLayoutId) {
      layoutName = this.state.sortedLayouts.find(layout => layout.id === this.state.targetLayoutId).name
    }


    return (
      <Dialog
        open={this.props.open}
        onClose={this.props.onClose}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle>{"My Layouts"}</DialogTitle>
        <DialogContent>
          <Typography>
            You have {this.props.layouts.length} layouts.
          </Typography>
          {_.range(this.state.sortedLayouts.length).map(idx => {
            const {sortedLayouts, layoutImageFiles} = this.state

            return (
                <LayoutCard
                  imgKey={layoutImageFiles[idx]}
                  title={sortedLayouts[idx].name}
                  lastModified={sortedLayouts[idx].lastModified}
                  onClick={this.onClick(sortedLayouts[idx])}
                  onDelete={this.openDeleteDialog(sortedLayouts[idx].id)}
                  onRename={this.openDeleteDialog(sortedLayouts[idx].id)}
                />
            )
          })}
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


