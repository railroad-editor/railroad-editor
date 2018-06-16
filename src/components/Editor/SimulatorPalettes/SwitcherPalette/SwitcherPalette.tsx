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
import CallSplitIcon from '@material-ui/icons/CallSplit';
import {LayoutStore, SwitcherData, SwitcherType} from "store/layoutStore";
import Rnd from "react-rnd"
import {
  CenteredDiv,
  HideableDiv,
  PaletteBodyPaper,
  ScrollablePaper
} from "components/Editor/SimulatorPalettes/PowerPackPalette/PowerPackPalette.style";
import NewSwitcherDialog from "components/Editor/SimulatorPalettes/SwitcherPalette/NewSwitcherDialog/NewSwitcherDialog";
import SwitcherList from "components/Editor/SimulatorPalettes/SwitcherPalette/SwitcherList/SwitcherList";


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



@inject(STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
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
    this.props.layout.addSwitcher({
      id: 0,
      name: name,
      type: type,
      currentState: 0,
      conductionStates: {}
    })
  }


  render() {
    let list, helpMessage
    if (! _.isEmpty(this.props.items)) {
      list = (
        <SwitcherList
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
                <CallSplitIcon />
                <Typography variant="subheading" color="inherit" style={{flex: 1}}>
                  {'Switchers'}
                </Typography>
                <Tooltip title={'Add Switcher'}>
                  <PrimaryPaletteAddButton onClick={this.openDialog}/>
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
          />
        </div>
      </Rnd>
    )
  }
}
