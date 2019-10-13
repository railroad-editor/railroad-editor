import * as React from 'react'
import {ReactNode} from 'react'
import {
  CenteredDiv,
  HideableDiv,
  PaletteBodyPaper,
  ScrollablePaper,
  StyledSelector,
} from "containers/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/RailPalette.style";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import {inject, observer} from "mobx-react";
import * as classNames from "classnames"
import {PaletteAddButton} from "components/PaletteAddButton/PaletteAddButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddBoxIcon from "@material-ui/icons/AddBox";
import {TitleDiv, TitleTypography} from "containers/Editor/Palettes/Palettes.style";
import {PaletteItem, RailData, WithBuilderStore} from "stores";
import {STORE_BUILDER} from "constants/stores";
import {reaction} from "mobx";


export type RailPaletteProps = {
  className?: string
  active: boolean
  title: string
  icon: ReactNode
  items: PaletteItem[]
  // TODO: 型を整理する
  customItems?: (PaletteItem | RailData)[]
  customDialog?: ReactNode
  openCustomDialog?: (e: React.SyntheticEvent<HTMLElement>) => void
  tooltipTitle?: string
  helpMessage?: string
} & WithBuilderStore


@inject(STORE_BUILDER)
@observer
export default class RailPalette extends React.Component<RailPaletteProps, {}> {

  scrollablePaper: any

  constructor(props: RailPaletteProps) {
    super(props)
    this.state = {
      addDialogOpen: false
    }

    reaction(
      () => this.props.builder.paletteItemIndex,
      (idx) => {
        if (! this.props.active) {
          return
        }
        const topIndex = this.scrollablePaper.scrollTop / 47.7
        if (idx < topIndex) {
          this.scrollablePaper.scrollTop = idx * 47.7
        }
        if (idx > topIndex + 15) {
          this.scrollablePaper.scrollTop = (idx - 15) * 47.7
        }
      }
    )
  }

  render() {
    let presetItems, customItems, helpMessage
    if (! _.isEmpty(this.props.items)) {
      presetItems = (
        <StyledSelector
          items={this.props.items}
          selectItem={this.props.builder.setPaletteItem}
          paletteItem={this.props.builder.paletteItem}
        />
      )
    }
    if (! _.isEmpty(this.props.customItems)) {
      customItems = (
        <>
          <Divider/>
          <StyledSelector
            items={this.props.customItems}
            selectItem={this.props.builder.setPaletteItem}
            paletteItem={this.props.builder.paletteItem}
            hasMenu
          />
        </>
      )
    }

    if (this.props.customDialog && _.isEmpty(this.props.customItems)) {
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
      // styleを上書きするために必要
      <div className={this.props.className}>
        <HideableDiv className={classNames({
          'hidden': ! this.props.active
        })}
        >
          <PaletteBodyPaper>
            <TitleDiv className='Palette__title'>
              {this.props.icon}
              <TitleTypography variant="subtitle1" color="inherit">
                {this.props.title}
              </TitleTypography>
              {this.props.customDialog &&
              <Tooltip title={this.props.tooltipTitle}>
                <PaletteAddButton onClick={this.props.openCustomDialog}/>
              </Tooltip>
              }
            </TitleDiv>
            <div>
              <ScrollablePaper ref={(ref) => this.scrollablePaper = ref}>
                {presetItems}
                {customItems}
                {helpMessage}
              </ScrollablePaper>
            </div>
          </PaletteBodyPaper>
        </HideableDiv>
        {this.props.customDialog}
      </div>
    )
  }
}

