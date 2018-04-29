import * as React from 'react'
import {DialogContent, DialogTitle} from "material-ui"
import Dialog from "material-ui/Dialog";
import Typography from "material-ui/Typography";
import {S3Image} from 'aws-amplify-react';
import LayoutAPI from "apis/layout"
import getLogger from "logging";
import {LayoutData, LayoutMeta} from "reducers/layout";
import {getLayoutImageFileName} from "apis/storage";
import {UserRailGroupData} from "reducers/builder";
import {RailItemData} from "components/rails";
import {LayoutCard} from "components/Editor/MenuDrawer/OpenDialog/LayoutCard/LayoutCard";
import {ConfirmationDialog} from "components/Editor/LayerPalette/ConfirmationDialog/ConfirmationDialog";

const LOGGER = getLogger(__filename)

export interface OpenDialogProps {
  open: boolean
  onClose: () => void
  authData: any
  setLayoutMeta: (meta: LayoutMeta) => void
  setLayoutData: (data: LayoutData) => void
  addUserRailGroup: (railGroup: UserRailGroupData) => void
  addUserCustomRail: (item: RailItemData) => void
}

export interface OpenDialogState {
  isLoaded: boolean
  layoutMetas: LayoutMeta[]
  layoutImageFiles: string[]

  deleteDialogOpen: boolean
  targetLayoutId: string
}


export class OpenDialog extends React.Component<OpenDialogProps, OpenDialogState> {

  constructor(props: OpenDialogProps) {
    super(props)
    this.state = {
      isLoaded: false,
      layoutMetas: [],
      layoutImageFiles: [],
      deleteDialogOpen: false,
      targetLayoutId: null
    }

    this.onClick = this.onClick.bind(this)
    this.onClose = this.onClose.bind(this)
    this.loadLayoutList = this.loadLayoutList.bind(this)
  }

  async loadLayoutList() {
    const list = await LayoutAPI.fetchLayoutList(this.props.authData.username)
    const sortedLayouts = list.layouts.sort((a, b) => b.lastModified - a.lastModified)
    LOGGER.info(list)
    this.setState({
      isLoaded: true,
      layoutMetas: sortedLayouts,
      layoutImageFiles: sortedLayouts.map(meta => getLayoutImageFileName(this.props.authData.username, meta.id))
    })
  }

  deleteLayout = (layoutId) => async () => {
    await LayoutAPI.deleteLayoutData(this.props.authData.username, layoutId)
    await this.loadLayoutList()
  }


  onClick = (meta: LayoutMeta) => async (e) => {
    this.props.setLayoutMeta(meta)
    const data = await LayoutAPI.fetchLayoutData(this.props.authData.username, meta.id)
    LOGGER.info(data)
    this.props.setLayoutData(data.layout)
    data.userRailGroups.forEach(rg => this.props.addUserRailGroup(rg))
    data.userCustomRails.forEach(cr => this.props.addUserCustomRail(cr))
    this.onClose()
  }

  onClose() {
    if (this.props.onClose) {
      this.props.onClose()
    }
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
      layoutName = this.state.layoutMetas.find(layout => layout.id === this.state.targetLayoutId).name
    }


    return (
      <Dialog
        open={this.props.open}
        onClose={this.onClose}
        onEnter={this.loadLayoutList}
        fullWidth
        maxWidth='md'
      >
        <DialogTitle id="my-layouts">{"My Layouts"}</DialogTitle>
        <DialogContent>
          <Typography>
            You have {this.state.layoutMetas.length} layouts.
          </Typography>
          {_.range(this.state.layoutMetas.length).map(idx => {
            const {layoutMetas, layoutImageFiles} = this.state

            return (
                <LayoutCard
                  imgKey={layoutImageFiles[idx]}
                  title={layoutMetas[idx].name}
                  lastModified={layoutMetas[idx].lastModified}
                  onClick={this.onClick(layoutMetas[idx])}
                  onDelete={this.openDeleteDialog(layoutMetas[idx].id)}
                  onRename={this.openDeleteDialog(layoutMetas[idx].id)}
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


