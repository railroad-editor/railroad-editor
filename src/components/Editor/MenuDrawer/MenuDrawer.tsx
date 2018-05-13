import * as React from "react";
import {ListItem, ListItemIcon, ListItemText} from "material-ui";
import Drawer from "material-ui/Drawer";
import List from "material-ui/List";
import CloudIcon from "material-ui-icons/Cloud";
import OpenInNewIcon from "material-ui-icons/OpenInNew";
import SaveIcon from "material-ui-icons/Save";
import SigninIcon from "material-ui-icons/Face";
import LoginIcon from "material-ui-icons/LockOpen";
import LogoutIcon from "material-ui-icons/Lock";
import ArchiveIcon from "material-ui-icons/Archive";
import OpenLayoutsDialog from "components/Editor/MenuDrawer/OpenLayoutsDialog/OpenLayoutsDialog";
import Auth from "aws-amplify/lib/Auth";
import StorageAPI from "apis/storage"
import Divider from "material-ui/Divider";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import SaveLayoutDialog from "components/Editor/MenuDrawer/SaveLayoutDialog/SaveLayoutDialog";
import * as moment from "moment";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {compose} from "recompose";
import LoginDialog from "components/Editor/ToolBar/LoginDialog/LoginDialog";
import SignUpDialog from "components/Editor/ToolBar/SignUpDialog/SignUpDialog";

const LOGGER = getLogger(__filename)


export interface MenuDrawerProps {
  open: boolean
  onClose: () => void

  common?: CommonStore
  layout?: LayoutStore
  builder?: BuilderStore

  snackbar: any
}

export interface MenuDrawerState {
  openLayouts: boolean
  openCreateNew: boolean
  openSaveNew: boolean
  openLogin: boolean
  openSignUp: boolean
  openLogout: boolean
}


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT)
@observer
export class MenuDrawer extends React.Component<MenuDrawerProps, MenuDrawerState> {

  constructor(props: MenuDrawerProps) {
    super(props)
    this.state = {
      openLayouts: false,
      openCreateNew: false,
      openSaveNew: false,
      openLogin: false,
      openSignUp: false,
      openLogout: false,
    }
  }

  /**
   * レイアウトを上書き保存する。
   * @returns {Promise<void>}
   */
  save = async () => {
    if (this.openLoginDialogIfNot()) {
      return
    }

    const {meta, currentLayoutData, saveLayout} = this.props.layout
    const {userRailGroups, userRails} = this.props.builder
    const {loadLayoutList, isAuth, userInfo} = this.props.common
    const userId = userInfo.username
    const savedData = {
      layout: currentLayoutData,
      meta: meta,
      userRailGroups: userRailGroups,
      userCustomRails: userRails,
    }
    LOGGER.info(savedData)
    saveLayout()
    StorageAPI.saveCurrentLayoutImage(userId, meta.id)
    // レイアウトリストをロードし直す
    loadLayoutList()
    this.props.onClose()
  }

  logout = async () => {
    await Auth.signOut()
    this.props.common.setAuthData(null)
    this.props.onClose()
  }

  openLoginDialogIfNot = () => {
    if (! this.props.common.isAuth) {
      this.props.snackbar.showMessage('Please login.')
      this.setState({ openLogin: true })
      return true
    }
    return false
  }

  openLayoutsDialog = () => {
    if (this.openLoginDialogIfNot()) {
      return
    }
    this.setState({ openLayouts: true })
  }

  closeLayoutsDialog = () => {
    this.setState({ openLayouts: false })
    this.props.onClose()
  }

  openCreateNewDialog = () => {
    this.setState({ openCreateNew: true })
  }

  closeCreateNewDialog = () => {
    this.setState({ openCreateNew: false })
    this.props.onClose()
  }

  openSaveNewDialog = () => {
    this.setState({ openSaveNew: true })
  }

  closeSaveNewDialog = () => {
    this.setState({ openSaveNew: false })
    this.props.onClose()
  }

  openLoginDialog = () => {
    this.setState({ openLogin: true })
  }

  closeLoginDialog = () => {
    this.setState({ openLogin: false })
    this.props.onClose()
  }

  openSignUpDialog = () => {
    this.setState({ openSignUp: true })
  }

  closeSignUpDialog = () => {
    this.setState({ openSignUp: false })
    this.props.onClose()
  }

  openLogoutDialog = () => {
    this.setState({ openLogout: true })
  }

  closeLogoutDialog = () => {
    this.setState({ openLogout: false })
    this.props.onClose()
  }

  /**
   * レイアウトをSVGファイルに変換し、ダウンロードする。
   * @param e
   */
  downloadAsSVG = (e) => {
    const basename = this.props.layout.meta.name
    const fileName = `${basename}-${moment().format('YYYYMMDD')}`  //`

    const svg = window.PAPER_SCOPE.project.exportSVG({asString:true})
    const url = "data:image/svg+xml;utf8," + encodeURIComponent(svg)
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
  }


  render() {
    const { open, onClose }  = this.props

    let authMenu
    if (this.props.common.isAuth) {
      authMenu = (
        <ListItem button onClick={this.openLogoutDialog}>
          <ListItemIcon>
            <LogoutIcon/>
          </ListItemIcon>
          <ListItemText primary="Logout"/>
        </ListItem>
      )
    } else {
      authMenu = (
        <>
          <ListItem button onClick={this.openSignUpDialog}>
            <ListItemIcon>
              <SigninIcon/>
            </ListItemIcon>
            <ListItemText primary="Sign-Up"/>
          </ListItem>
          <ListItem button onClick={this.openLoginDialog}>
            <ListItemIcon>
              <LoginIcon/>
            </ListItemIcon>
            <ListItemText primary="Login"/>
          </ListItem>
        </>
      )
    }


    return (
      <Drawer
        open={open}
        onClose={onClose}
        anchor="left"
      >
        <List>
          {authMenu}
          <Divider />
          <ListItem button onClick={this.openLayoutsDialog}>
            <ListItemIcon>
              <CloudIcon/>
            </ListItemIcon>
            <ListItemText primary="My Layouts"/>
          </ListItem>
          <ListItem button onClick={this.openCreateNewDialog}>
            <ListItemIcon>
              <OpenInNewIcon/>
            </ListItemIcon>
            <ListItemText primary="New Layout"/>
          </ListItem>
          <ListItem button onClick={this.save}>
            <ListItemIcon>
              <SaveIcon/>
            </ListItemIcon>
            <ListItemText primary="Save"/>
          </ListItem>
          <ListItem button onClick={this.openSaveNewDialog}>
            <ListItemIcon>
              <SaveIcon/>
            </ListItemIcon>
            <ListItemText primary="Save As..."/>
          </ListItem>
          <ListItem button onClick={this.downloadAsSVG}>
            <ListItemIcon>
              <ArchiveIcon/>
            </ListItemIcon>
            <ListItemText primary="Export as SVG"/>
          </ListItem>
        </List>
        <LoginDialog
          open={this.state.openLogin}
          onClose={this.closeLoginDialog}
          setAuthData={this.props.common.setAuthData}
          loadLayoutList={this.props.common.loadLayoutList}
        />
        <SignUpDialog
          open={this.state.openSignUp}
          onClose={this.closeSignUpDialog}
          setAuthData={this.props.common.setAuthData}
          loadLayoutList={this.props.common.loadLayoutList}
        />
        <SaveLayoutDialog
          title={"Create New Layout"}
          open={this.state.openCreateNew}
          onClose={this.closeCreateNewDialog}
          authData={this.props.common.userInfo}
          saveLayout={this.props.layout.saveLayout}
          setLayoutMeta={this.props.layout.setLayoutMeta}
          layoutConfig={this.props.layout.config}
        />
        <SaveLayoutDialog
          title={"Save Layout"}
          open={this.state.openSaveNew} onClose={this.closeSaveNewDialog}
          authData={this.props.common.userInfo}
          saveLayout={this.props.layout.saveLayout}
          setLayoutMeta={this.props.layout.setLayoutMeta}
          layoutConfig={this.props.layout.config}
        />
        <OpenLayoutsDialog
          open={this.state.openLayouts}
          onClose={this.closeLayoutsDialog}
          authData={this.props.common.userInfo}
          layouts={this.props.common.layouts}
          loadLayout={this.props.layout.loadLayout}
          loadLayoutList={this.props.common.loadLayoutList}
        />
      </Drawer>
    )
  }
}


export default compose<MenuDrawerProps, MenuDrawerProps|any>(
  withSnackbar()
)(MenuDrawer)
