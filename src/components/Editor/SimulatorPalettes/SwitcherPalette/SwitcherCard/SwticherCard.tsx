import * as React from 'react'
import {CardHeader, Grid, MenuItem, Typography} from '@material-ui/core'
import {S3Image} from 'aws-amplify-react';
import getLogger from "logging";
import Menu from "@material-ui/core/Menu";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import {ConductionStates, LayoutStore, SwitcherData} from "store/layoutStore";
import {FeederInfo} from "components/rails/RailBase";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";
import SwitcherSettingDialog
  from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitcherSettingDialog/SwitcherSettingDialog";
import {
  ActiveSmallButton,
  NarrowCardContent,
} from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitchCard.style";
import DeleteIcon from '@material-ui/icons/Delete';
import RailIcon from "components/common/RailIcon/RailIcon";
import {RailComponentClasses, RailData} from "components/rails/index";

const LOGGER = getLogger(__filename)


export interface SwitcherCardProps {
  item: SwitcherData
  feeders: FeederInfo[]
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
}

export interface SwitcherCardState {
  anchorEl: HTMLElement
  sliderValue: number
  sliderDragging: boolean
  direction: boolean
  dialogOpen: boolean
}



@inject(STORE_LAYOUT_LOGIC, STORE_LAYOUT)
@observer
export class SwitcherCard extends React.Component<SwitcherCardProps, SwitcherCardState> {

  constructor(props: SwitcherCardProps) {
    super(props)
    this.state = {
      anchorEl: null,
      sliderValue: 0,
      sliderDragging: false,
      direction: true,
      dialogOpen: false,
    }
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: e.currentTarget});
  }

  onMenuClose = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: null})
  }

  onSetting = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      dialogOpen: true
    })
    this.onMenuClose(e)
  }

  onSettingDialogClosed = () => {
    this.setState({
      dialogOpen: false
    })
  }

  onDelete = (e: React.MouseEvent<HTMLElement>) => {
    this.props.layout.deleteSwitcher({
      id: this.props.item.id
    })
    this.onMenuClose(e)
  }

  transformConductionStates = (conductionStates: ConductionStates) => {
    const rails = {}
    _.keys(conductionStates).forEach(stateIdxStr => {
      const stateIdx = Number(stateIdxStr)
      conductionStates[stateIdx].forEach(state => {
        if (! rails[state.railId]) {
          rails[state.railId] = {}
        }
        rails[state.railId][stateIdx] = state.conductionState
      })
    })
    return rails
  }

  onSwitchStateChange = (state: number) => (e) => {
    this.props.layoutLogic.changeSwitcherState(this.props.item.id, state)
  }

  onDisconnectRail = (railId: number) => (e) => {
    this.props.layoutLogic.disconnectTurnoutFromSwitcher(Number(railId), this.props.item.id)
  }


  render() {
    const {name, conductionStates} = this.props.item
    const transformedConductionStates = this.transformConductionStates(conductionStates)

    return (
      <>
        <Card>
          <CardHeader
            title={name}
            action={
              <IconButton
                onClick={this.openMenu}
              >
                <MoreVertIcon/>
              </IconButton>
            }
            // style={{paddingTop: '16px', paddingBottom: '8px'}}
          />
          <NarrowCardContent>
            {_.keys(transformedConductionStates).map(railIdStr => {
              const railId = Number(railIdStr)
              const rail = this.props.layout.getRailDataById(railId)
              return (
                <Grid container justify="center" alignItems="center" spacing={0}>
                  <Grid item xs={3}>
                    <Typography align="center"> {rail.name} </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <ActiveSmallButton
                      active={this.props.item.currentState === 0}
                      onClick={this.onSwitchStateChange(0)}
                    >
                      <RailIcon
                        width={30}
                        height={30}
                        rail={createRailComponentForIcon(rail, 0)}
                      />
                    </ActiveSmallButton>
                  </Grid>
                  <Grid item xs={3}>
                    <ActiveSmallButton
                      active={this.props.item.currentState === 1}
                      onClick={this.onSwitchStateChange(1)}
                    >
                      <RailIcon
                        width={30}
                        height={30}
                        rail={createRailComponentForIcon(rail, 1)}
                      />
                    </ActiveSmallButton>
                  </Grid>
                  <Grid item xs={3}>
                    <IconButton
                      onClick={this.onDisconnectRail(railId)}
                    >
                      <DeleteIcon/>
                    </IconButton>
                  </Grid>
                </Grid>
              )
            })}
          </NarrowCardContent>
        </Card>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.onMenuClose}
        >
          <MenuItem onClick={this.onSetting}>Setting</MenuItem>}
          <MenuItem onClick={this.onDelete}>Delete</MenuItem>}
        </Menu>
        <SwitcherSettingDialog
          title={'Switcher Settings'}
          open={this.state.dialogOpen}
          onClose={this.onSettingDialogClosed}
          switcher={this.props.item}
          updateSwitcher={this.props.layout.updateSwitcher}
        />
      </>
    )
  }
}

export const createRailComponentForIcon = (item: RailData, conductionState: number) => {
  const {id: id, type: type, ...props} = item
  let RailContainer = RailComponentClasses[type]
  if (RailContainer == null) {
    throw Error(`'${type}' is not a valid Rail type!`)
  }
  return (
    <RailContainer
      // key={id}
      // id={id}
      {...props}
      conductionState={conductionState}
    />
  )
}
