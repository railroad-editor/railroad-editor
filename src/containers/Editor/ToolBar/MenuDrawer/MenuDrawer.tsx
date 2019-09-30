import * as React from "react";
import {ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
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
import OpenLayoutsDialog from "containers/Editor/ToolBar/MenuDrawer/OpenLayoutsDialog/OpenLayoutsDialog";
import {Auth, I18n} from "aws-amplify";
import Divider from "@material-ui/core/Divider";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {EditorStore} from "stores/editorStore";
import {LayoutMeta, LayoutStore} from "stores/layoutStore";
import SaveLayoutDialog from "containers/Editor/ToolBar/MenuDrawer/SaveLayoutDialog/SaveLayoutDialog";
import LoginDialog from "containers/Editor/ToolBar/MenuDrawer/LoginDialog/LoginDialog";
import SignUpDialog from "containers/Editor/ToolBar/MenuDrawer/SignUpDialog/SignUpDialog";
import {UiStore} from "stores/uiStore";
import {KeyLabel} from "components/KeyLabel/KeyLabel";
import {SettingsDialog} from "./SettingsDialog/SettingsDialog";
import SettingsIcon from "@material-ui/icons/Settings";
import AssignmentIcon from "@material-ui/icons/Assignment";
import {runInAction} from "mobx";
import BugReportDialog from "./BugReportDialog/BugReportDialog";
import BomDialog from "./BomDialog/BomDialog";
import moment from 'moment';
import {LAYOUT_LOADED, LAYOUT_SAVED, REQUIRE_LOGIN} from "constants/messages";
import {ProjectUseCase} from "useCases/projectUseCase";
import {WithEditorStore, WithLayoutStore, WithUiStore} from "stores";
import {WithProjectUseCase} from "useCases";
import {STORE_EDITOR, STORE_LAYOUT, STORE_UI} from "constants/stores";
import {USECASE_PROJECT} from "constants/useCases";

const LOGGER = getLogger(__filename)


export type MenuDrawerProps = {
  open: boolean
  onClose: () => void

  editor?: EditorStore
  layout?: LayoutStore
  ui?: UiStore
  projectUseCase?: ProjectUseCase
} & WithEditorStore & WithLayoutStore & WithUiStore & WithProjectUseCase

export interface MenuDrawerState {
}


@inject(STORE_EDITOR, STORE_LAYOUT, STORE_UI, USECASE_PROJECT)
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
    this.props.editor.setUserInfo(null)
    this.props.onClose()
  }

  loadLayout = async (layoutId: string) => {
    await this.props.projectUseCase.loadLayout(layoutId)
    this.props.ui.setCommonSnackbar(true, I18n.get(LAYOUT_LOADED), 'success')
  }

  openLoginDialogIfNot = () => {
    if (! this.props.editor.isAuth) {
      this.props.ui.setDrawer(false)
      this.props.ui.setLoginDialog(true)
      this.props.ui.setCommonSnackbar(true, I18n.get(REQUIRE_LOGIN), 'error')
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
    await this.props.projectUseCase.saveLayout()
    this.props.ui.setCommonSnackbar(true, I18n.get(LAYOUT_SAVED), 'success')
  }

  onSaveAs = async (meta: LayoutMeta) => {
    if (this.openLoginDialogIfNot()) {
      return
    }
    // 先にDrawerを閉じる
    this.props.onClose()
    // metaを更新してから保存する
    this.props.layout.setLayoutMeta(meta)
    await this.props.projectUseCase.saveLayout()
    this.props.ui.setCommonSnackbar(true, I18n.get(LAYOUT_SAVED), 'success')
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

  /**
   * レイアウトをSVGファイルに変換し、ダウンロードする
   */
  downloadAsSVG = (e) => {
    const basename = this.props.layout.meta.name
    const fileName = `${basename}-${moment().format('YYYYMMDD')}`  //`

    const svg = this.props.editor.paper.project.exportSVG({asString: true})
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
    if (this.props.editor.isAuth) {
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
            authData={this.props.editor.userInfo}
            layoutConfig={this.props.layout.config}
          />
          <OpenLayoutsDialog
            open={ui.layoutsDialog}
            onClose={this.closeLayoutsDialog}
            userInfo={this.props.editor.userInfo}
            layouts={this.props.editor.layouts}
            loadLayout={this.loadLayout}
            loadLayoutList={this.props.projectUseCase.loadLayoutList}
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
          authData={this.props.editor.userInfo}
          layoutConfig={this.props.layout.config}
        />
        <LoginDialog
          open={ui.loginDialog}
          onClose={this.closeLoginDialog}
          setAuthData={this.props.editor.setUserInfo}
          loadLayoutList={this.props.projectUseCase.loadLayoutList}
        />
        <SignUpDialog
          open={ui.signInDialog}
          onClose={this.closeSignUpDialog}
          setAuthData={this.props.editor.setUserInfo}
          loadLayoutList={this.props.projectUseCase.loadLayoutList}
        />
        <SettingsDialog
          title={'Layout Settings'}
          open={ui.settingsDialog}
          onClose={this.closeSettingsDialog}
          config={this.props.layout.config}
          setConfig={this.props.layout.setConfig}
          userInfo={this.props.editor.userInfo}
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
      </>
    )
  }
}

