import * as React from 'react'
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import {inject, observer} from "mobx-react";
import * as classNames from "classnames"
import {PaletteAddButton} from "components/PaletteAddButton/PaletteAddButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddBoxIcon from "@material-ui/icons/AddBox";
// import PowerIcon from '@material-ui/icons/Power';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import {LayoutStore, SwitcherData, SwitcherType} from "stores/layoutStore";
import Rnd from "react-rnd"
import {
  CenteredDiv,
  HideableDiv,
  PaletteBodyPaper,
  ScrollablePaper
} from "containers/Editor/Palettes/SimulatorPalettes/PowerPackPalette/PowerPackPalette.style";
import NewSwitcherDialog
  from "containers/Editor/Palettes/SimulatorPalettes/SwitcherPalette/NewSwitcherDialog/NewSwitcherDialog";
import {SwitcherCard} from "containers/Editor/Palettes/SimulatorPalettes/SwitcherPalette/SwitcherCard/SwticherCard";
import {DEFAULT_SWITCHER_COLOR} from "constants/tools";
import {TitleDiv, TitleTypography} from "containers/Editor/Palettes/Palettes.style";
import {STORE_BUILDER, STORE_LAYOUT} from 'constants/stores';


export interface SwitcherPaletteProps {
  className?: string
  active: boolean
  items: SwitcherData[]
  helpMessage?: string
  layout?: LayoutStore
}


export interface PowerPackPaletteState {
  dialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export default class SwitcherPalette extends React.Component<SwitcherPaletteProps, PowerPackPaletteState> {

  constructor(props: SwitcherPaletteProps) {
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

  addSwitcher = (name: string, type: SwitcherType) => {
    let conductionStates
    switch (type) {
      case SwitcherType.NORMAL:
        conductionStates = {0: [], 1: []}
        break
      case SwitcherType.THREE_WAY:
        conductionStates = {0: [], 1: [], 2: []}
        break
    }
    this.props.layout.addSwitcher({
      id: 0,
      name: name,
      type: type,
      currentState: 0,
      conductionStates: conductionStates,
      color: DEFAULT_SWITCHER_COLOR
    })
  }


  render() {
    let list, helpMessage
    if (! _.isEmpty(this.props.items)) {
      list = (
        <>
          {
            this.props.items.map((item, index) => {
              return (
                <SwitcherCard
                  item={item}
                  feeders={this.props.layout.currentLayoutData.feeders}
                />
              )
            })
          }
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
                <CallSplitIcon/>
                <TitleTypography variant="subtitle1" color="inherit">
                  {'Switchers'}
                </TitleTypography>
                <Tooltip title={'Add Switcher'}>
                  <PaletteAddButton onClick={this.openDialog}/>
                </Tooltip>
              </TitleDiv>
              <ScrollablePaper>
                {list}
                {helpMessage}
              </ScrollablePaper>
            </PaletteBodyPaper>
          </HideableDiv>
          <NewSwitcherDialog
            title={'New Switcher'}
            open={this.state.dialogOpen}
            onClose={this.onCloseDialog}
            addSwitcher={this.addSwitcher}
            defaultInputs={{type: SwitcherType.NORMAL, name: `S${this.props.layout.nextSwitcherId}`}}
          />
        </div>
      </Rnd>
    )
  }
}
