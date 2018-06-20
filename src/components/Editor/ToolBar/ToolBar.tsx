import * as React from 'react'
import {
  AppBar,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Toolbar as MuiToolbar, Tooltip,
  Typography, withStyles
} from '@material-ui/core'
import {StyledIconButton} from "./styles";
import {Tools} from "constants/tools";
import MenuIcon from "@material-ui/icons/Menu";
import getLogger from "logging";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {CommonStore} from "store/commonStore";
import MenuDrawer from "components/Editor/MenuDrawer/MenuDrawer";
import {compose} from "recompose";
import {EditableTypography} from "components/common/EditableTypography/EditableTypography";
import Peer from 'skyway-js';
import {LayoutLogicStore} from "store/layoutLogicStore";
import BuilderToolBar from "components/Editor/ToolBar/BuilderToolBar/BuilderToolBar";
import withMoveTool from "components/hoc/withMoveTool";
import SimulatorToolBar from "components/Editor/ToolBar/SimulatorToolBar/SimulatorToolBar";
import {EditorMode} from "store/uiStore";
import BuildIcon from '@material-ui/icons/Build';
import PlayArrowIcon from '@material-ui/icons/PlayCircleFilled';
import {PrimaryColorActiveButton} from "components/common/ActiveButton";
import {PrimaryColorActiveMenuItem} from 'components/common/ActiveMenuItem';
import {StyledTooltip} from "components/Editor/Editor.style";

const LOGGER = getLogger(__filename)


export interface ToolBarProps {
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore

  resetViewPosition: () => void
  snackbar: any
  classes?: any
}

export interface ToolBarState {
  openMenu: boolean
  openSettings: boolean
  el: HTMLElement | undefined
  editorMode: EditorMode
}

type EnhancedToolBarProps = ToolBarProps & WithBuilderPublicProps

// TODO: MenuItemの色変わらね〜〜〜！！！
// const styles = theme => ({
//   menuItem: {
//     '&$selected': {
//       backgroundColor: 'orange'
//     },
//     root: {
//       '&$selected': {
//         backgroundColor: 'orange'
//       },
//     },
//     selected: {
//       backgroundColor: 'orange !important'
//     },
//   }
// })


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
@observer
export class ToolBar extends React.Component<EnhancedToolBarProps, ToolBarState> {

  myPeerId: string
  peer: Peer
  targetPeerId: string
  conn: any

  constructor(props: EnhancedToolBarProps) {
    super(props)
    this.state = {
      openMenu: false,
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

  isActive(tool: string) {
    return this.props.builder.activeTool === tool
  }

  onClickBuilderItem = (tool: Tools) => (e: MouseEvent) => {
    this.props.builder.setActiveTool(tool)
    // 最後に選択していたアイテムを選択する
    this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[tool])
  }


  openMenu = (e) => {
    LOGGER.info(this.props.layout.meta)
    this.setState({
      openMenu: true,
    })
  }

  closeMenu = () => {
    this.setState({
      openMenu: false,
    })
  }

  openSettingsDialog = (e) => {
    this.setState({
      openSettings: true
    })
  }

  closeSettingsDialog = () => {
    this.setState({
      openSettings: false
    })
  }

  setLayoutName = (text: string) => {
    this.props.layout.updateLayoutMeta({
      name: text
    })
  }

  onChangePlacingMode = (mode: PlacingMode) => (e) => {
    this.props.builder.setPlacingMode(mode)
  }

  onChangeEditorMode = (e) => {
    this.props.common.setEditorMode(e.target.value)
  }


  render() {
    return (
      <>
        <AppBar>
          <MuiToolbar>
            <Grid container justify="space-between" spacing={0}>
              <Grid xs justify="flex-start" alignItems="center" style={{display: 'flex'}}>
                <Tooltip title={"Menu"}>
                  <StyledIconButton onClick={this.openMenu} >
                    <MenuIcon/>
                  </StyledIconButton>
                </Tooltip>
                <MenuDrawer open={this.state.openMenu} onClose={this.closeMenu}/>

                <Tooltip title={'Layout Name'}>
                  <EditableTypography
                    variant="title"
                    color="inherit"
                    text={this.props.layout.meta.name}
                    onOK={this.setLayoutName}
                  />
                </Tooltip>
              </Grid>

              {
                this.props.common.editorMode === EditorMode.BUILDER &&
                <BuilderToolBar />
              }
              {
                this.props.common.editorMode === EditorMode.SIMULATOR &&
                <SimulatorToolBar />
              }


              <Grid xs justify="flex-end" alignItems="center" style={{display: 'flex'}}>
                <Tooltip title={'Editor Mode'} PopperProps={{style: {zIndex: '1000'}}}
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
      </>
    )
  }
}


export default compose<ToolBarProps, ToolBarProps>(
  withBuilder,
  withMoveTool,
  // withStyles(styles)
)(ToolBar)
