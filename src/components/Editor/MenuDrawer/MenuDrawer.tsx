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
import OpenLayoutDialog from "components/Editor/MenuDrawer/OpenLayoutDialog/OpenLayoutDialog";
import Auth from "aws-amplify/lib/Auth";
import LayoutAPI from "apis/layout"
import StorageAPI from "apis/storage"
import {LayoutData, LayoutMeta} from "reducers/layout";
import Divider from "material-ui/Divider";
import getLogger from "logging";
import {UserRailGroupData} from "reducers/builder";
import {RailItemData} from "components/rails";
import {AuthData} from "components/common/Authenticator/AuthPiece/AuthPiece";
import {SettingsDialog} from "components/Editor/ToolBar/SettingsDialog/SettingsDialog";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import SaveLayoutDialog from "components/Editor/MenuDrawer/SaveLayoutDialog/SaveLayoutDialog";

const LOGGER = getLogger(__filename)


export interface MenuDrawerProps {
  open: boolean
  onClose: () => void

  common?: CommonStore
  layout?: LayoutStore
  builder?: BuilderStore
}

export interface MenuDrawerState {
  openOpen: boolean
  openCreateNew: boolean
  openSaveNew: boolean
}


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT)
@observer
export class MenuDrawer extends React.Component<MenuDrawerProps, MenuDrawerState> {

  constructor(props: MenuDrawerProps) {
    super(props)
    this.state = {
      openOpen: false,
      openCreateNew: false,
      openSaveNew: false,
    }
  }


  save = async () => {
    const {meta, currentLayoutData} = this.props.layout
    const {userRailGroups, userRails} = this.props.builder
    const {authData} = this.props.common

    const userId = authData.username
    if (meta) {
      const savedData = {
        layout: currentLayoutData,
        meta: meta,
        userRailGroups: userRailGroups,
        userCustomRails: userRails,
      }
      LOGGER.info(savedData)
      // LayoutAPI.saveLayoutData(userId, savedData)
      StorageAPI.saveCurrentLayoutImage(userId, meta.id)
      this.props.onClose()
    } else {
      this.openSaveNewDialog()
    }
  }

  logout = async () => {
    await Auth.signOut()
    this.props.common.setAuthData(null)
    this.props.onClose()
  }

  openLayoutsDialog = () => {
    this.setState({ openOpen: true })
  }

  closeLayoutsDialog = () => {
    this.setState({ openOpen: false })
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
            {this.props.common.isAuth &&
              <React.Fragment>
                <ListItem button onClick={this.logout}>
                  <ListItemIcon>
                    <LogoutIcon/>
                  </ListItemIcon>
                  <ListItemText primary="Logout"/>
                </ListItem>
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
              </React.Fragment>
            }
          </List>
          <SaveLayoutDialog
            title={"Create New Layout"}
            open={this.state.openCreateNew}
            onClose={this.closeCreateNewDialog}
            authData={this.props.common.authData}
            saveLayout={this.props.layout.saveLayout}
            setLayoutMeta={this.props.layout.setLayoutMeta}
          />
          <SaveLayoutDialog
            title={"Save Layout"}
            open={this.state.openSaveNew} onClose={this.closeSaveNewDialog}
            authData={this.props.common.authData}
            saveLayout={this.props.layout.saveLayout}
            setLayoutMeta={this.props.layout.setLayoutMeta}
          />
          <OpenLayoutDialog
            open={this.state.openOpen}
            onClose={this.closeLayoutsDialog}
            authData={this.props.common.authData}
            layouts={this.props.common.layouts}
            loadLayout={this.props.layout.loadLayout}
            loadLayoutList={this.props.common.loadLayoutList}
          />
          {/*<LoginDialog open={this.state.openLogin} onClose={this.closeLoginDialog}/>*/}
        </div>
      </Drawer>
    )
  }
}
