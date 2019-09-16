import * as React from 'react'
import {Grid, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, MenuItem, Switch} from '@material-ui/core'
import DeleteIcon from '@material-ui/icons/Delete'
import getLogger from "logging";
import Menu from "@material-ui/core/Menu";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import IconButton from "@material-ui/core/IconButton";
import PowerIcon from "@material-ui/icons/Power";
import Card from "@material-ui/core/Card";
import {LayoutStore, PowerPackData} from "store/layoutStore";
import {inject, observer} from 'mobx-react';
import {STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {BuilderActions} from "store/builderActions";
import PowerPackSettingDialog
  from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackSettingDialog/PowerPackSettingDialog";
import {
  NarrowCardContent,
  NarrowCardHeader,
  SmallButton,
  StyledList,
  StyledSlider,
  Triangle
} from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackCard/PowerPackCard.style";
import {FeederInfo} from "react-rail-components";
import {reaction} from "mobx";
import SimulatorActions from "../../../../../../store/simulatorActions";

const LOGGER = getLogger(__filename)


export interface PowerPackCardProps {
  item: PowerPackData
  feeders: FeederInfo[]
  layout?: LayoutStore
  layoutLogic?: BuilderActions
}

export interface PowerPackCardState {
  anchorEl: HTMLElement
  sliderValue: number
  dialogOpen: boolean
}


@inject(STORE_LAYOUT_LOGIC, STORE_LAYOUT)
@observer
export class PowerPackCard extends React.Component<PowerPackCardProps, PowerPackCardState> {

  throttledUpdatePowerPack: (item: Partial<PowerPackData>) => void

  constructor(props: PowerPackCardProps) {
    super(props)
    this.state = {
      anchorEl: null,
      sliderValue: 0,
      dialogOpen: false,
    }

    // スライダーの値をPropsと同期する
    reaction(() => this.props.item.power,
      () => this.setState({
        sliderValue: this.props.item.power
      })
    )

    // スライダーをドラッグした時に、画面の再描画とコントローラーのコマンド送信の頻度を抑えるためにPowerPackの状態更新をスロットルする
    // TODO: Wait時間を再考する
    this.throttledUpdatePowerPack = _.throttle((data) => this.props.layout.updatePowerPack(data), 1000, {
      leading: true,
      trailing: true
    })
  }

  componentDidUpdate() {
    // スライダーの電流値がショートなどの原因で反映されなかった場合、元の値に戻す
    // if (this.props.item.power !== this.state.sliderValue) {
    //   this.setState({sliderValue: this.props.item.power})
    // }
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

  onSliderChange = (e, value) => {
    const intValue = Math.round(value)
    this.throttledUpdatePowerPack({id: this.props.item.id, power: intValue})
    this.setState({
      sliderValue: value
    })
  }

  onDirectionChange = (e) => {
    // TODO: 電流を自動で0にするかどうかは設定で変えられるようにすべき
    this.props.layout.updatePowerPack({
      id: this.props.item.id,
      power: 0,
      direction: e.target.checked,
    })
  }

  onDisconnectFeeder = (id) => (e) => {
    SimulatorActions.disconnectFeederFromPowerPack(id)
  }

  /**
   * STOPボタンが押されたら電流をゼロにする
   * @param e
   */
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
    const {name, direction, power, supplyingFeederIds, color, isError} = this.props.item

    LOGGER.debug('slider', this.state.sliderValue)
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
                  checked={direction}
                  onChange={this.onDirectionChange}
                  value="checkedA"
                />
              </Grid>
            </Grid>
            <StyledSlider
              max={255}
              value={this.state.sliderValue}
              onChange={this.onSliderChange}
              aria-labelledby="label"
            />
            <StyledList>
              {
                supplyingFeederIds.map(id => {
                  const feeder = this.props.feeders.find(f => f.id === id)
                  return (
                    <ListItem button>
                      <ListItemIcon>
                        <PowerIcon/>
                      </ListItemIcon>
                      <ListItemText primary={feeder.name}/>
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

