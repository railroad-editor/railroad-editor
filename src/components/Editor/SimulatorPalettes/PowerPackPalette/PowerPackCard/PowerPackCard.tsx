import * as React from 'react'
import {
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon, ListItemSecondaryAction, ListItemText,
  MenuItem,
  Switch
} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import {S3Image} from 'aws-amplify-react';
import getLogger from "logging";
import Menu from "@material-ui/core/Menu";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from "@material-ui/core/IconButton";
import PowerIcon from "@material-ui/icons/Power";
import Card from "@material-ui/core/Card";
import {PowerPackData} from "store/layoutStore";
import Slider from '@material-ui/lab/Slider';
import {FeederInfo} from "components/rails/RailBase";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";

const LOGGER = getLogger(__filename)


export interface PowerPackCardProps {
  item: PowerPackData
  feeders: FeederInfo[]
  onPowerChange: (power: number) => void
  onDirectionChange: (direction: boolean) => void
  onSetting: (item: PowerPackData) => void
  onDelete: (item: PowerPackData) => void
  layoutLogic?: LayoutLogicStore
}

export interface PowerPackCardState {
  anchorEl: HTMLElement
  sliderValue: number
  sliderDragging: boolean
  direction: boolean
}



@inject(STORE_LAYOUT_LOGIC)
@observer
export class PowerPackCard extends React.Component<PowerPackCardProps, PowerPackCardState> {

  constructor(props: PowerPackCardProps) {
    super(props)
    this.state = {
      anchorEl: null,
      sliderValue: 0,
      sliderDragging: false,
      direction: true,
    }
  }

  onSliderDragStart = (e) => {
    this.setState({
      sliderDragging: true
    })
  }

  onSliderDragEnd = (e) => {
    this.setState({
      sliderDragging: false
    })
    this.props.onPowerChange(this.state.sliderValue)
  }

  onSliderChange = (e, value) => {
    this.setState({
      sliderValue: value
    })
    if (! this.state.sliderDragging) {
      this.props.onPowerChange(this.state.sliderValue)
    }
  }

  onDirectionChange = (e) => {
    this.setState({ direction: e.target.checked });
    this.props.onDirectionChange(e.target.checked)
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: e.currentTarget});
  }

  onMenuClose = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: null})
  }

  onSetting = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onSetting(this.props.item)
    this.onMenuClose(e)
  }

  onDelete = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onDelete(this.props.item)
    this.onMenuClose(e)
  }

  onDisconnectFeeder = (id) => (e) => {
    this.props.layoutLogic.disconnectFeederFromPowerPack(id, this.props.item.id)
  }

  render() {
    const {name, direction, power, supplyingFeederIds} = this.props.item

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
            <Switch
              checked={this.state.direction}
              onChange={this.onDirectionChange}
              value="checkedA"
            />
            <Slider
              value={this.state.sliderValue}
              onChange={this.onSliderChange}
              onDragStart={this.onSliderDragStart}
              onDragEnd={this.onSliderDragEnd}
              aria-labelledby="label"
            />
            <Divider />
            <List>
              {
                supplyingFeederIds.map(id => {
                  const feeder = this.props.feeders.find(f => f.id === id)
                  return (
                    <ListItem>
                      <ListItemIcon>
                        <PowerIcon />
                      </ListItemIcon>
                      <ListItemText primary={feeder.name} />
                      <ListItemSecondaryAction>
                        <IconButton>
                          <DeleteIcon onClick={this.onDisconnectFeeder(id)}/>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  )
                })
              }
            </List>
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
      </>
    )
  }
}

