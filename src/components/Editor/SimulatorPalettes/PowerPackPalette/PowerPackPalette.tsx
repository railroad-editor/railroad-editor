import * as React from 'react'
import {TitleDiv} from "../../BuilderPalettes/LayerPalette/styles";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import * as classNames from "classnames"
import {PrimaryPaletteAddButton} from "components/common/PaletteAddButton/PaletteAddButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddBoxIcon from "@material-ui/icons/AddBox";
import {Scrollbars} from 'react-custom-scrollbars';
// import PowerIcon from '@material-ui/icons/Power';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';
import NewPowerPackDialog
  from "components/Editor/SimulatorPalettes/PowerPackPalette/NewPowerPackDialog/NewPowerPackDialog";
import PowerPackList from "components/Editor/SimulatorPalettes/PowerPackPalette/PowerPackList/PowerPackList";
import {LayoutStore, PowerPackData} from "store/layoutStore";
import Rnd from "react-rnd"
import {
  CenteredDiv,
  HideableDiv,
  PaletteBodyPaper,
  ScrollablePaper
} from "components/Editor/SimulatorPalettes/PowerPackPalette/PowerPackPalette.style";


export interface SimulatorPaletteProps {
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
export default class SimulatorPalette extends React.Component<SimulatorPaletteProps, PowerPackPaletteState> {

  constructor(props: SimulatorPaletteProps) {
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
      direction: true,
      supplyingFeederIds: [],
      color: 'black'
    })
  }


  render() {
    let list, helpMessage
    if (! _.isEmpty(this.props.items)) {
      list = (
        <PowerPackList
          items={this.props.items}
        />
      )
    }

    if (_.isEmpty(this.props.items)) {
      const splitMessages = this.props.helpMessage.split('+')
      helpMessage = (
        <>
          <Divider/>
          <CenteredDiv>
            <Typography align="left">
              {splitMessages[0]} <AddBoxIcon color="primary" style={{fontSize: '16px', marginBottom: '-3px'}}/> {splitMessages[1]}
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
                <PowerIcon />
                <Typography variant="subheading" color="inherit" style={{flex: 1}}>
                  {'Power Units'}
                </Typography>
                <Tooltip title={'Add Power Unit'}>
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
          />
        </div>
      </Rnd>
    )
  }
}
