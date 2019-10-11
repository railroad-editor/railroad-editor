import * as React from 'react'
import {
  AppBar,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar as MuiToolbar,
  Tooltip
} from '@material-ui/core'
import {StyledIconButton} from "./styles";
import MenuIcon from "@material-ui/icons/Menu";
import getLogger from "logging";
import {LayoutStore} from "stores/layoutStore";
import {inject, observer} from "mobx-react";
import {BuilderStore} from "stores/builderStore";
import {EditorMode, EditorStore} from "stores/editorStore";
import MenuDrawer from "containers/Editor/ToolBar/MenuDrawer/MenuDrawer";
import {EditableTypography} from "containers/common/EditableTypography/EditableTypography";
import BuilderToolBar from "containers/Editor/ToolBar/BuilderToolBar/BuilderToolBar";
import SimulatorToolBar from "containers/Editor/ToolBar/SimulatorToolBar/SimulatorToolBar";
import {UiStore} from "stores/uiStore";
import BuildIcon from '@material-ui/icons/Build';
import PlayArrowIcon from '@material-ui/icons/PlayCircleFilled';
import {STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT, STORE_UI} from "constants/stores";

const LOGGER = getLogger(__filename)


export interface ToolBarProps {
  editor?: EditorStore
  builder?: BuilderStore
  layout?: LayoutStore
  ui?: UiStore

  resetViewPosition: () => void
  classes?: any
}

export interface ToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
  editorMode: EditorMode
}


@inject(STORE_EDITOR, STORE_BUILDER, STORE_LAYOUT, STORE_UI)
@observer
export default class ToolBar extends React.Component<ToolBarProps, ToolBarState> {

  constructor(props: ToolBarProps) {
    super(props)
    this.state = {
      openSettings: false,
      el: undefined,
      editorMode: EditorMode.BUILDER
    }
  }

  openMenu = (e) => {
    LOGGER.info(this.props.layout.meta)
    this.props.ui.setDrawer(true)
  }

  closeMenu = () => {
    this.props.ui.setDrawer(false)
  }

  setLayoutName = (text: string) => {
    this.props.layout.updateLayoutMeta({
      name: text
    })
  }

  onChangeEditorMode = (e) => {
    this.props.editor.setMode(e.target.value)
  }


  render() {
    return (
      <AppBar>
        <MuiToolbar>
          <Grid container justify="space-between" spacing={0}>
            <Grid item xs alignItems="center" style={{display: 'flex'}}>
              <Tooltip title={"Menu"}>
                <StyledIconButton onClick={this.openMenu}>
                  <MenuIcon/>
                </StyledIconButton>
              </Tooltip>
              <MenuDrawer open={this.props.ui.drawer} onClose={this.closeMenu}/>

              <Tooltip title={'Layout Name'}>
                <EditableTypography
                  variant="h6"
                  color="inherit"
                  text={this.props.layout.meta.name}
                  onOK={this.setLayoutName}
                />
              </Tooltip>
            </Grid>

            {
              this.props.editor.mode === EditorMode.BUILDER &&
              <BuilderToolBar/>
            }
            {
              this.props.editor.mode === EditorMode.SIMULATOR &&
              <SimulatorToolBar/>
            }


            <Grid item xs justify="flex-end" alignItems="center" style={{display: 'flex'}}>
              <Tooltip title={'Editor Mode'}
                // PopperProps={{style: {zIndex: '1000'}}}
              >
                <Select
                  value={this.props.editor.mode}
                  onChange={this.onChangeEditorMode}
                  renderValue={value => {
                    return (
                      <>
                        {value === EditorMode.BUILDER && <ListItemIcon><BuildIcon/></ListItemIcon>}
                        {value === EditorMode.SIMULATOR && <ListItemIcon><PlayArrowIcon/></ListItemIcon>}
                      </>
                    )
                  }}
                >
                  <MenuItem
                    value={EditorMode.BUILDER}
                  >
                    <ListItemIcon>
                      <BuildIcon/>
                    </ListItemIcon>
                    <ListItemText primary={EditorMode.BUILDER}/>
                  </MenuItem>
                  <MenuItem
                    value={EditorMode.SIMULATOR}
                  >
                    <ListItemIcon>
                      <PlayArrowIcon/>
                    </ListItemIcon>
                    <ListItemText primary={EditorMode.SIMULATOR}/>
                  </MenuItem>
                </Select>
              </Tooltip>
            </Grid>
          </Grid>
        </MuiToolbar>
      </AppBar>
    )
  }
}

