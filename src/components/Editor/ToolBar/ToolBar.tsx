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
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_UI} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import {CommonStore} from "store/commonStore";
import MenuDrawer from "components/Editor/ToolBar/MenuDrawer/MenuDrawer";
import {compose} from "recompose";
import {EditableTypography} from "components/common/EditableTypography/EditableTypography";
import Peer from 'skyway-js';
import {LayoutLogicStore} from "store/layoutLogicStore";
import BuilderToolBar from "components/Editor/ToolBar/BuilderToolBar/BuilderToolBar";
import withMoveTool from "components/hoc/withMoveTool";
import SimulatorToolBar from "components/Editor/ToolBar/SimulatorToolBar/SimulatorToolBar";
import {EditorMode, UiStore} from "store/uiStore";
import BuildIcon from '@material-ui/icons/Build';
import PlayArrowIcon from '@material-ui/icons/PlayCircleFilled';

const LOGGER = getLogger(__filename)


export interface ToolBarProps {
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
  ui?: UiStore

  resetViewPosition: () => void
  classes?: any
}

export interface ToolBarState {
  openSettings: boolean
  el: HTMLElement | undefined
  editorMode: EditorMode
}


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_UI)
@observer
export class ToolBar extends React.Component<ToolBarProps, ToolBarState> {

  myPeerId: string
  peer: Peer

  constructor(props: ToolBarProps) {
    super(props)
    this.state = {
      openSettings: false,
      el: undefined,
      editorMode: EditorMode.BUILDER
    }
  }

  componentDidMount() {
    this.peer = new Peer({
      key: '423ec210-715b-4916-971f-bd800a835414',
      debug: 3,
    });
    // Show this peer's ID.
    this.peer.on('open', id => {
      this.myPeerId = id
      console.log('open', this.myPeerId)
    });

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
    this.props.common.setEditorMode(e.target.value)
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
              this.props.common.editorMode === EditorMode.BUILDER &&
              <BuilderToolBar/>
            }
            {
              this.props.common.editorMode === EditorMode.SIMULATOR &&
              <SimulatorToolBar/>
            }


            <Grid item xs justify="flex-end" alignItems="center" style={{display: 'flex'}}>
              <Tooltip title={'Editor Mode'}
                // PopperProps={{style: {zIndex: '1000'}}}
              >
                <Select
                  value={this.props.common.editorMode}
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


export default compose<ToolBarProps, ToolBarProps>(
  withMoveTool,
  // withStyles(styles)
)(ToolBar)
