import * as React from "react";
import {ListItem, ListItemIcon, ListItemText, Portal} from '@material-ui/core';
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import CloudIcon from "@material-ui/icons/Cloud";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import SaveIcon from "@material-ui/icons/Save";
import SigninIcon from "@material-ui/icons/PermIdentity";
import LoginIcon from "@material-ui/icons/LockOpen";
import LogoutIcon from "@material-ui/icons/Lock";
import HelpIcon from "@material-ui/icons/Help";
import BugReportIcon from "@material-ui/icons/BugReport";
import ArchiveIcon from "@material-ui/icons/Archive";
import OpenLayoutsDialog from "components/Editor/ToolBar/MenuDrawer/OpenLayoutsDialog/OpenLayoutsDialog";
import Auth from "aws-amplify/lib/Auth";
import Divider from "@material-ui/core/Divider";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_PAPER, STORE_UI} from "constants/stores";
import {CommonStore} from "store/commonStore";
import {LayoutMeta, LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import SaveLayoutDialog from "components/Editor/ToolBar/MenuDrawer/SaveLayoutDialog/SaveLayoutDialog";
import LoginDialog from "components/Editor/ToolBar/MenuDrawer/LoginDialog/LoginDialog";
import SignUpDialog from "components/Editor/ToolBar/MenuDrawer/SignUpDialog/SignUpDialog";
import {UiStore} from "store/uiStore";
import {KeyLabel} from "components/common/KeyLabel/KeyLabel";
import {LayoutLogicStore} from "store/layoutLogicStore";
import {SettingsDialog} from "./SettingsDialog/SettingsDialog";
import SettingsIcon from "@material-ui/icons/Settings";
import AssignmentIcon from "@material-ui/icons/Assignment";
import {runInAction} from "mobx";
import BugReportDialog from "./BugReportDialog/BugReportDialog";
import BomDialog from "./BomDialog/BomDialog";
import MySnackbar from "../../../common/Snackbar/MySnackbar";
import {PaperStore} from "../../../../store/paperStore.";
import * as moment from "moment";

const LOGGER = getLogger(__filename)


export interface MenuDrawerProps {
  open: boolean
  onClose: () => void

  common?: CommonStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
  builder?: BuilderStore
  ui?: UiStore
  paper?: PaperStore
}

export interface MenuDrawerState {
}


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_UI, STORE_PAPER)
@observer
export default class MenuDrawer extends React.Component<MenuDrawerProps, MenuDrawerState> {

  appRoot: any

  constructor(props: MenuDrawerProps) {
    super(props)
    this.state = {}
    this.appRoot = document.getElementById("app")
  }

  logout = async () => {
    await Auth.signOut()
    this.props.common.setAuthData(null)
    this.props.onClose()
  }

  loadLayout = async (layoutId: string) => {
    await this.props.layoutLogic.loadLayout(layoutId)
    this.props.ui.setLoadedLayoutSnackbar(true)
  }

  openLoginDialogIfNot = () => {
    if (! this.props.common.isAuth) {
      this.props.ui.setDrawer(false)
      this.props.ui.setLoginDialog(true)
      this.props.ui.setRequireLoginSnackbar(true)
      return true
    }
    return false
  }

  openSignUpDialog = () => {
    this.props.ui.setSignInDialog(true)
  }

  closeSignUpDialog = () => {
    this.props.ui.setSignInDialog(false)
    this.props.onClose()
  }

  openLoginDialog = () => {
    this.props.ui.setLoginDialog(true)
  }

  closeLoginDialog = () => {
    this.props.ui.setLoginDialog(false)
    this.props.onClose()
  }

  openLayoutsDialog = () => {
    this.props.ui.setLayoutsDialog(true)
  }

  closeLayoutsDialog = () => {
    this.props.ui.setLayoutsDialog(false)
    this.props.onClose()
  }

  openCreateNewDialog = () => {
    this.props.ui.setCreateNewDialog(true)
  }

  closeCreateNewDialog = () => {
    this.props.ui.setCreateNewDialog(false)
    this.props.onClose()
  }

  openSaveNewDialog = () => {
    this.props.ui.setSaveNewDialog(true)
  }

  closeSaveNewDialog = () => {
    this.props.ui.setSaveNewDialog(false)
    this.props.onClose()
  }

  onCreateNew = (meta: LayoutMeta) => {
    runInAction(() => {
      this.props.layout.resetLayoutData()
      this.props.layout.updateLayoutMeta(meta)
    })
  }

  onSave = async () => {
    if (this.openLoginDialogIfNot()) {
      return
    }
    // 先にDrawerを閉じる
    this.props.onClose()
    await this.props.layoutLogic.saveLayout()
    this.props.ui.setSavedLayoutSnackbar(true)
  }

  onSaveAs = async (meta: LayoutMeta) => {
    if (this.openLoginDialogIfNot()) {
      return
    }
    // 先にDrawerを閉じる
    this.props.onClose()
    // metaを更新してから保存する
    this.props.layout.setLayoutMeta(meta)
    await this.props.layoutLogic.saveLayout()
    this.props.ui.setSavedLayoutSnackbar(true)
  }

  openSettingsDialog = () => {
    this.props.ui.setSettingsDialog(true)
  }

  closeSettingsDialog = () => {
    this.props.ui.setSettingsDialog(false)
    this.props.onClose()
  }

  openSummaryDialog = () => {
    this.props.ui.setSummaryDialog(true)
  }

  closeSummaryDialog = () => {
    this.props.ui.setSummaryDialog(false)
    this.props.onClose()
  }

  onOpenUserManual = () => {
    this.props.onClose()
  }

  openBugReportDialog = () => {
    this.props.ui.setBugReportDialog(true)
  }

  closeBugReportDialog = () => {
    this.props.ui.setBugReportDialog(false)
    this.props.onClose()
  }

  closeRequireLoginSnackbar = () => {
    this.props.ui.setRequireLoginSnackbar(false)
  }

  closeSavedLayoutSnackbar = () => {
    this.props.ui.setSavedLayoutSnackbar(false)
  }

  closeLoadedLayoutSnackbar = () => {
    this.props.ui.setLoadedLayoutSnackbar(false)
  }

  closeLoggedInSnackbar = () => {
    this.props.ui.setLoggedInSnackbar(false)
  }

  closeNoRailForGroupSnackbar = () => {
    this.props.ui.setNoRailForGroupSnackbar(false)
  }

  closeRegisteredRailGroupSnackbar = () => {
    this.props.ui.setRegisteredRailGroupSnackbar(false, "")
  }

  closeBugReportSnackbar = () => {
    this.props.ui.setBugReportSnackbar(false)
  }

  closeNoSessionSnackbar = () => {
    this.props.ui.setRemoteNotConnectedSnackbar(false)
  }

  closeRemoteConnectedSnackbar = () => {
    this.props.ui.setRemoteConnectedSnackbar(false)
  }

  /**
   * レイアウトをSVGファイルに変換し、ダウンロードする
   */
  downloadAsSVG = (e) => {
    const basename = this.props.layout.meta.name
    const fileName = `${basename}-${moment().format('YYYYMMDD')}`  //`

    const svg = this.props.paper.scope.project.exportSVG({asString: true})
    const url = "data:image/svg+xml;utf8," + encodeURIComponent(svg as any)
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
    this.props.onClose()
  }


  render() {
    const {open, onClose, ui} = this.props

    let authMenu, dialogs
    if (this.props.common.isAuth) {
      // For logined users
      authMenu = (
        <ListItem button onClick={this.logout}>
          <ListItemIcon>
            <LogoutIcon/>
          </ListItemIcon>
          <ListItemText primary="Logout"/>
        </ListItem>
      )
      dialogs = (
        <>
          <SaveLayoutDialog
            title={"Save Layout"}
            open={ui.saveNewDialog} onClose={this.closeSaveNewDialog}
            onOK={this.onSaveAs}
            authData={this.props.common.userInfo}
            layoutConfig={this.props.layout.config}
          />
          <OpenLayoutsDialog
            open={ui.layoutsDialog}
            onClose={this.closeLayoutsDialog}
            authData={this.props.common.userInfo}
            layouts={this.props.common.layouts}
            loadLayout={this.loadLayout}
            loadLayoutList={this.props.common.loadLayoutList}
          />
        </>
      )
    } else {
      // For not logined users
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
      <>
        <Drawer
          open={open}
          onClose={onClose}
          anchor="left"
        >
          <List>

            {authMenu}

            <Divider/>
            <ListItem button onClick={this.openLayoutsDialog}>
              <ListItemIcon>
                <CloudIcon/>
              </ListItemIcon>
              <ListItemText primary="My Layouts"/>
              <KeyLabel text={'Ctrl + O'}/>
            </ListItem>
            <ListItem button onClick={this.openCreateNewDialog}>
              <ListItemIcon>
                <OpenInNewIcon/>
              </ListItemIcon>
              <ListItemText primary="New Layout"/>
              <KeyLabel text={'Ctrl + F'}/>
            </ListItem>
            <ListItem button onClick={this.onSave}>
              <ListItemIcon>
                <SaveIcon/>
              </ListItemIcon>
              <ListItemText primary="Save"/>
              <KeyLabel text={'Ctrl + S'}/>
            </ListItem>
            <ListItem button onClick={this.openSaveNewDialog}>
              <ListItemIcon>
                <SaveIcon/>
              </ListItemIcon>
              <ListItemText primary="Save As..."/>
            </ListItem>
            <ListItem button onClick={this.openSettingsDialog}>
              <ListItemIcon>
                <SettingsIcon/>
              </ListItemIcon>
              <ListItemText primary="Settings"/>
            </ListItem>
            <ListItem button onClick={this.openSummaryDialog}>
              <ListItemIcon>
                <AssignmentIcon/>
              </ListItemIcon>
              <ListItemText primary="BOM"/>
            </ListItem>
            <ListItem button onClick={this.downloadAsSVG}>
              <ListItemIcon>
                <ArchiveIcon/>
              </ListItemIcon>
              <ListItemText primary="Export as SVG"/>
            </ListItem>
            <Divider/>
            <ListItem button component="a" target="_blank" href="http://d2t6ssvra5p03o.cloudfront.net/index.html"
                      onClick={this.onOpenUserManual}
            >
              <ListItemIcon>
                <HelpIcon/>
              </ListItemIcon>
              <ListItemText primary="User Manual"/>
            </ListItem>
            <ListItem button onClick={this.openBugReportDialog}>
              <ListItemIcon>
                <BugReportIcon/>
              </ListItemIcon>
              <ListItemText primary="Report a Bug"/>
            </ListItem>
          </List>
        </Drawer>

        <SaveLayoutDialog
          title={"Create New Layout"}
          open={ui.createNewDialog}
          onClose={this.closeCreateNewDialog}
          onOK={this.onCreateNew}
          authData={this.props.common.userInfo}
          layoutConfig={this.props.layout.config}
        />
        <LoginDialog
          open={ui.loginDialog}
          onClose={this.closeLoginDialog}
          setAuthData={this.props.common.setAuthData}
          loadLayoutList={this.props.common.loadLayoutList}
        />
        <SignUpDialog
          open={ui.signInDialog}
          onClose={this.closeSignUpDialog}
          setAuthData={this.props.common.setAuthData}
          loadLayoutList={this.props.common.loadLayoutList}
        />
        <SettingsDialog
          title={'Layout Settings'}
          open={ui.settingsDialog}
          onClose={this.closeSettingsDialog}
          config={this.props.layout.config}
          setConfig={this.props.layout.setConfig}
          userInfo={this.props.common.userInfo}
          layoutMeta={this.props.layout.meta}
        />
        <BomDialog
          title={"Layout BOM"}
          open={ui.summaryDialog}
          onClose={this.closeSummaryDialog}
        />
        <BugReportDialog
          title={"Report a Bug"}
          open={ui.bugReportDialog}
          onClose={this.closeBugReportDialog}
        />
        {dialogs}

        <Portal container={this.appRoot}>
          <MySnackbar open={ui.requireLoginSnackbar}
                      onClose={this.closeRequireLoginSnackbar}
                      message={'Please login.'}
                      variant="error"
          />
          <MySnackbar open={ui.savedLayoutSnackbar}
                      onClose={this.closeSavedLayoutSnackbar}
                      message={'Layout saved.'}
                      variant="success"
          />
          <MySnackbar open={ui.loadedLayoutSnackbar}
                      onClose={this.closeLoadedLayoutSnackbar}
                      message={'Layout loaded.'}
                      variant="success"
          />
          <MySnackbar open={ui.loggedInSnackbar}
                      onClose={this.closeLoggedInSnackbar}
                      message={'Logged-in successfully.'}
                      variant="success"
          />

          <MySnackbar open={ui.noRailForGroupSnackbar}
                      onClose={this.closeNoRailForGroupSnackbar}
                      message={'Please select at least one rail.'}
                      variant="warning"
          />
          <MySnackbar open={ui.registeredRailGroupSnackbar}
                      onClose={this.closeRegisteredRailGroupSnackbar}
                      message={ui.registeredRailGroupSnackbarMessage}
                      variant="success"
          />
          <MySnackbar open={ui.bugReportSnackbar}
                      onClose={this.closeBugReportSnackbar}
                      message={'Your issue is submitted successfully. Thank you for reporting!'}
                      variant="success"
          />
          <MySnackbar open={ui.remoteNotConnectedSnackbar}
                      onClose={this.closeNoSessionSnackbar}
                      message={'Could not connect to remote Railroad Controller'}
                      variant="error"
          />
          <MySnackbar open={ui.remoteConnectedSnackbar}
                      onClose={this.closeRemoteConnectedSnackbar}
                      message={'Connected to remote Railroad Controller.'}
                      variant="success"
          />
        </Portal>
      </>
    )
  }
}

