import * as React from 'react'
import {CardContent, CardHeader, MenuItem} from '@material-ui/core'
import {S3Image} from 'aws-amplify-react';
import getLogger from "logging";
import Menu from "@material-ui/core/Menu";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import {LayoutStore, SwitcherData} from "store/layoutStore";
import {FeederInfo} from "components/rails/RailBase";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";
import SwitcherSettingDialog
  from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwitcherSettingDialog/SwitcherSettingDialog";

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


  render() {
    const {name, conductionStates} = this.props.item

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
          <CardContent>
            {/*<List>*/}
              {/*{*/}
                {/*conductionStates.map(id => {*/}
                  {/*const feeder = this.props.feeders.find(f => f.id === id)*/}
                  {/*return (*/}
                    {/*<ListItem>*/}
                      {/*<ListItemIcon>*/}
                        {/*<PowerIcon />*/}
                      {/*</ListItemIcon>*/}
                      {/*<ListItemText primary={feeder.name} />*/}
                      {/*<ListItemSecondaryAction>*/}
                        {/*<IconButton>*/}
                          {/*<DeleteIcon onClick={this.onDisconnectFeeder(id)}/>*/}
                        {/*</IconButton>*/}
                      {/*</ListItemSecondaryAction>*/}
                    {/*</ListItem>*/}
                  {/*)*/}
                {/*})*/}
              {/*}*/}
            {/*</List>*/}
          </CardContent>
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

