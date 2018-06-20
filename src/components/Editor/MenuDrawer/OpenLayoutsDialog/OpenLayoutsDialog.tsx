import * as React from 'react'
import {DialogContent, DialogTitle} from '@material-ui/core'
import Dialog from "@material-ui/core/Dialog";
import Typography from "@material-ui/core/Typography";
import {S3Image} from 'aws-amplify-react';
import LayoutAPI from "apis/layout"
import getLogger from "logging";
import {getLayoutImageFileName} from "apis/storage";
import {LayoutCard} from "components/Editor/MenuDrawer/OpenLayoutsDialog/LayoutCard/LayoutCard";
import {LayoutMeta} from "store/layoutStore";
import Grid from "@material-ui/core/Grid";
import {ConfirmationDialog} from "components/Editor/Palettes/BuilderPalettes/LayerPalette/ConfirmationDialog/ConfirmationDialog";

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
      layoutName = this.props.layouts.find(layout => layout.id === this.state.targetLayoutId).name
    }

    const sortedLayouts = this.props.layouts.sort((a, b) => b.lastModified - a.lastModified)


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
          <Grid container spacing={24}>
          {sortedLayouts.map((meta, idx) => {
            const layoutImageFile = getLayoutImageFileName(this.props.authData.username, meta.id)
            return (
              <Grid item xs={4}>
                <LayoutCard
                  key={`card-${idx}`}
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


