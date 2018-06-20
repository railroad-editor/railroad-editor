import * as React from 'react'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  FormControlLabel, Grid,
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
import {LayoutStore, PowerPackData} from "store/layoutStore";
import Slider from '@material-ui/lab/Slider';
import {FeederInfo} from "components/rails/RailBase";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {LayoutLogicStore} from "store/layoutLogicStore";
import PowerPackSettingDialog
  from "components/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackSettingDialog/PowerPackSettingDialog";
import {
  NarrowCardContent,
  NarrowCardHeader, SmallButton, StyledList, StyledSlider, Triangle
} from "components/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackCard/PowerPackCard.style";

const LOGGER = getLogger(__filename)


export interface PowerPackCardProps {
  item: PowerPackData
  feeders: FeederInfo[]
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
}

export interface PowerPackCardState {
  anchorEl: HTMLElement
  sliderValue: number
  sliderDragging: boolean
  direction: boolean
  dialogOpen: boolean
}



@inject(STORE_LAYOUT_LOGIC, STORE_LAYOUT)
@observer
export class PowerPackCard extends React.Component<PowerPackCardProps, PowerPackCardState> {

  constructor(props: PowerPackCardProps) {
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
    this.props.layout.deletePowerPack({
      id: this.props.item.id
    })
    this.onMenuClose(e)
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
    this.props.layout.updatePowerPack({
      id: this.props.item.id,
      power: this.state.sliderValue
    })

  }

  onSliderChange = (e, value) => {
    this.setState({
      sliderValue: value
    })
    if (! this.state.sliderDragging) {
      this.props.layout.updatePowerPack({
        id: this.props.item.id,
        power: value
      })
    }
  }

  onDirectionChange = (e) => {
    // TODO: 電流を自動で0にするかどうかは設定で変えられるようにすべき
    this.setState({
      // sliderValue: 0,
      direction: e.target.checked
    });

    this.props.layout.updatePowerPack({
      id: this.props.item.id,
      // power: 0,
      direction: e.target.checked,
    })
  }

  onDisconnectFeeder = (id) => (e) => {
    this.props.layoutLogic.disconnectFeederFromPowerPack(id)
  }

  onStop = (e) => {
    this.setState({
      sliderValue: 0
    })
    this.props.layout.updatePowerPack({
      id: this.props.item.id,
      power: 0
    })
  }


  render() {
    const {name, direction, power, supplyingFeederIds, color} = this.props.item

    return (
      <>
        <Card>
          <Triangle color={color}/>
          <NarrowCardHeader
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
            <Grid container alignItems="center" justify="space-between" spacing={0}>
              <Grid item xs>
                <SmallButton
                  onClick={this.onStop}
                  variant="outlined"
                >
                  STOP
                </SmallButton>
              </Grid>
              <Grid item xs>
                <Switch
                  checked={this.state.direction}
                  onChange={this.onDirectionChange}
                  value="checkedA"
                />
              </Grid>
            </Grid>
            <StyledSlider
              value={this.state.sliderValue}
              onChange={this.onSliderChange}
              onDragStart={this.onSliderDragStart}
              onDragEnd={this.onSliderDragEnd}
              aria-labelledby="label"
            />
            <StyledList>
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
            </StyledList>
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
        <PowerPackSettingDialog
          title={'Power Pack Settings'}
          open={this.state.dialogOpen}
          onClose={this.onSettingDialogClosed}
          powerPack={this.props.item}
          updatePowerPack={this.props.layout.updatePowerPack}
        />
      </>
    )
  }
}

