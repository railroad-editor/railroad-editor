import * as React from 'react'
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import * as classNames from "classnames"
import {PrimaryPaletteAddButton} from "containers/common/PaletteAddButton/PaletteAddButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddBoxIcon from "@material-ui/icons/AddBox";
// import PowerIcon from '@material-ui/icons/Power';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';
import NewPowerPackDialog
  from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/NewPowerPackDialog/NewPowerPackDialog";
import {LayoutStore, PowerPackData} from "store/layoutStore";
import Rnd from "react-rnd"
import {
  CenteredDiv,
  HideableDiv,
  PaletteBodyPaper,
  ScrollablePaper
} from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackPalette.style";
import {PowerPackCard} from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackCard/PowerPackCard";
import {TitleDiv, TitleTypography} from "containers/Editor/Palettes/Palettes.style";
import {DEFAULT_POWER_PACK_COLOR} from "constants/tools";


export interface PowerPackPaletteProps {
  className?: string
  active: boolean
  items: PowerPackData[]
  helpMessage?: string
  layout?: LayoutStore
}


export interface PowerPackPaletteState {
  dialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
@observer
export default class PowerPackPalette extends React.Component<PowerPackPaletteProps, PowerPackPaletteState> {

  constructor(props: PowerPackPaletteProps) {
    super(props)
    this.state = {
      dialogOpen: false
    }
  }


  openDialog = () => {
    this.setState({
      dialogOpen: true
    })
  }

  onCloseDialog = () => {
    this.setState({
      dialogOpen: false
    })
  }

  addPowerPack = (name: string) => {
    this.props.layout.addPowerPack({
      id: 0,
      name: name,
      power: 0,
      direction: false,
      supplyingFeederIds: [],
      color: DEFAULT_POWER_PACK_COLOR,
      isError: false,
    })
  }


  render() {
    let list, helpMessage
    if (! _.isEmpty(this.props.items)) {
      list = (
        <>
          {this.props.items.map((item, index) => {
            return (
              <PowerPackCard
                item={item}
                feeders={this.props.layout.currentLayoutData.feeders}
              />
            )
          })}
        </>
      )
    }

    if (_.isEmpty(this.props.items)) {
      const splitMessages = this.props.helpMessage.split('+')
      helpMessage = (
        <>
          <Divider/>
          <CenteredDiv>
            <Typography align="left">
              {splitMessages[0]} <AddBoxIcon color="primary"
                                             style={{fontSize: '16px', marginBottom: '-3px'}}/> {splitMessages[1]}
            </Typography>
          </CenteredDiv>
        </>
      )
    }

    return (
      <Rnd
        className={this.props.className}
        dragHandleClassName='.Palette__title'
      >
        <div className={this.props.className}>
          <HideableDiv className={classNames({
            'hidden': ! this.props.active
          })}
          >
            <PaletteBodyPaper>
              <TitleDiv className='Palette__title'>
                <PowerIcon/>
                <TitleTypography variant="subheading" color="inherit">
                  {'Power Packs'}
                </TitleTypography>
                <Tooltip title={'Add Power Pack'}>
                  <PrimaryPaletteAddButton onClick={this.openDialog}/>
                </Tooltip>
              </TitleDiv>
              <ScrollablePaper>
                {list}
                {helpMessage}
              </ScrollablePaper>
            </PaletteBodyPaper>
          </HideableDiv>
          <NewPowerPackDialog
            title={'New Power Pack'}
            open={this.state.dialogOpen}
            onClose={this.onCloseDialog}
            addPowerPack={this.addPowerPack}
            defaultInputs={{name: `P${this.props.layout.nextPowerPackId}`}}
          />
        </div>
      </Rnd>
    )
  }
}
