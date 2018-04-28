import * as React from "react";
import {ListItem, ListItemIcon, ListItemText} from "material-ui";
import Drawer from "material-ui/Drawer";
import List from "material-ui/List";
import CloudIcon from "material-ui-icons/Cloud";
import OpenInNewIcon from "material-ui-icons/OpenInNew";
import SaveIcon from "material-ui-icons/Save";
import LoginIcon from "material-ui-icons/LockOpen";
import LogoutIcon from "material-ui-icons/Lock";
import SettingsIcon from "material-ui-icons/Settings";
import LayoutNameDialog from "components/Editor/MenuDrawer/NewLayoutDialog";
import OpenDialog from "components/Editor/MenuDrawer/OpenDialog";
import LoginDialog from "components/Editor/ToolBar/LoginDialog";
import Auth from "aws-amplify/lib/Auth";
import LayoutAPI from "apis/layout"
import StorageAPI from "apis/storage"
import {LayoutData, LayoutMeta} from "reducers/layout";
import Divider from "material-ui/Divider";
import getLogger from "logging";
import SettingsDialog from "components/Editor/MenuDrawer/SettingsDialog";
import {UserRailGroupData} from "reducers/builder";
import {RailItemData} from "components/rails";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";

const LOGGER = getLogger(__filename)


export interface MenuDrawerProps {
  open: boolean
  onClose: () => void

  authData: any
  currentLayoutData: LayoutData
  layoutMeta: LayoutMeta
  userRailGroups: UserRailGroupData[]
  userCustomRails: RailItemData[]

  setAuthData: (authData: AuthData) => void
}

export interface MenuDrawerState {
  openLogin: boolean
  openOpen: boolean
  openCreateNew: boolean
  openSaveNew: boolean
  openSettings: boolean
}


export class MenuDrawer extends React.Component<MenuDrawerProps, MenuDrawerState> {

  constructor(props: MenuDrawerProps) {
    super(props)
    this.state = {
      openLogin: false,
      openOpen: false,
      openCreateNew: false,
      openSaveNew: false,
      openSettings: false
    }
  }


  save = async () => {
    const {authData, layoutMeta, currentLayoutData, userRailGroups, userCustomRails} = this.props
    const userId = authData.username
    if (layoutMeta) {
      const savedData = {
        layout: currentLayoutData,
        meta: layoutMeta,
        userRailGroups: userRailGroups,
        userCustomRails: userCustomRails,
      }
      LOGGER.info(savedData)
      LayoutAPI.saveLayoutData(userId, savedData)
      StorageAPI.saveCurrentLayoutImage(userId, layoutMeta.id)
      this.closeMenu()
    } else {
      this.openSaveNewDialog()
    }
  }

  logout = async () => {
    await Auth.signOut()
    this.props.setAuthData(null)
    this.closeMenu()
  }

  openLoginDialog = () => {
    this.setState({ openLogin: true })
  }

  closeLoginDialog = () => {
    this.setState({ openLogin: false })
    this.closeMenu()
  }

  openOpenDialog = () => {
    this.setState({ openOpen: true })
  }

  closeOpenDialog = () => {
    this.setState({ openOpen: false })
    this.closeMenu()
  }

  openCreateNewDialog = () => {
    this.setState({ openCreateNew: true })
  }

  closeCreateNewDialog = () => {
    this.setState({ openCreateNew: false })
    this.closeMenu()
  }

  openSaveNewDialog = () => {
    this.setState({ openSaveNew: true })
  }

  closeSaveNewDialog = () => {
    this.setState({ openSaveNew: false })
    this.closeMenu()
  }

  openSettingsDialog = () => {
    this.setState({
      openSettings: true
    })
  }

  closeSettingsDialog = () => {
    this.setState({
      openSettings: false
    })
    this.closeMenu()
  }

  closeMenu = () => {
    this.props.onClose()
  }


  render() {
    const { open, onClose }  = this.props

    return (
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
      >
        {/*これが無いとログアウト時にフックしてくれないので必須*/}
        {/*<Authenticator hidden={true}/>*/}
        <div
          tabIndex={0}
          role="button"
          // onClick={this.toggleDrawer('left', false)}
          // onKeyDown={this.toggleDrawer('left', false)}
        >
          <List>
            {! this.props.authData &&
            <ListItem button
                      onClick={this.openLoginDialog}
              >
                <ListItemIcon>
                  <LoginIcon/>
                </ListItemIcon>
                <ListItemText primary="Login"/>
              </ListItem>
            }
            {this.props.authData &&
              <React.Fragment>
                <ListItem button onClick={this.logout}>
                  <ListItemIcon>
                    <LogoutIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Logout"/>
                </ListItem>
                <Divider />
                <ListItem button onClick={this.openOpenDialog}>
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
                <ListItem button onClick={this.openSettingsDialog}>
                  <ListItemIcon>
                    <SettingsIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Settings"/>
                </ListItem>
              </React.Fragment>
            }
          </List>
          <LayoutNameDialog
            title={"Create New Layout"}
            okButtonTitle={"Create"}
            open={this.state.openCreateNew}
            onClose={this.closeCreateNewDialog}/>
          <LayoutNameDialog
            save
            title={"Save New Layout"}
            okButtonTitle={"Save"}
            open={this.state.openSaveNew} onClose={this.closeSaveNewDialog}/>
          <OpenDialog open={this.state.openOpen} onClose={this.closeOpenDialog}/>
          <LoginDialog open={this.state.openLogin} onClose={this.closeLoginDialog}/>
          <SettingsDialog open={this.state.openSettings} onClose={this.closeSettingsDialog}/>
        </div>
      </Drawer>
    )
  }
}
