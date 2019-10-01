import * as React from 'react'
import InfoIcon from '@material-ui/icons/Info';
import {Grid} from '@material-ui/core'
import {ContentDiv, EvenGrid, GridContainer, OddGrid, ScrollablePaper} from "./InfoPalette.style";
import Rnd from 'react-rnd'
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "stores/layoutStore";
import {TitleDiv, TitleTypography} from "containers/Editor/Palettes/Palettes.style";
import Typography from "@material-ui/core/Typography";
import {STORE_LAYOUT} from "constants/stores";

const LOGGER = getLogger(__filename)

export interface InfoPaletteProps {
  className?: string
  layout?: LayoutStore
}

export interface InfoPaletteState {
}

@inject(STORE_LAYOUT)
@observer
export default class InfoPalette extends React.Component<InfoPaletteProps, InfoPaletteState> {

  constructor(props: InfoPaletteProps) {
    super(props)
  }

  renderContent = () => {
    const selectedRails = this.props.layout.selectedRails

    if (selectedRails.length === 0) {
      return (
        <GridContainer container spacing={1}>
          <Grid item xs={12}>
            <Typography>Select any rail</Typography>
          </Grid>
        </GridContainer>
      )
    }
    if (selectedRails.length > 1) {
      return (
        <GridContainer container spacing={1}>
          <Grid item xs={12}>
            <Typography>
              {selectedRails.length} rails are selected
            </Typography>
          </Grid>
        </GridContainer>
      )
    }

    const selected = selectedRails[0]
    return (
      <GridContainer container spacing={1}>
        <OddGrid item xs={4}>
          <Typography>Name</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <Typography>
            {selected.name}
          </Typography>
        </OddGrid>
        <EvenGrid item xs={4}>
          <Typography>Type</Typography>
        </EvenGrid>
        <EvenGrid item xs={8}>
          <Typography>
            {selected.type}
          </Typography>
        </EvenGrid>
        <OddGrid item xs={4}>
          <Typography>Position</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <Typography>
            ({selected.position.x.toFixed()}, {selected.position.y.toFixed()})
          </Typography>
        </OddGrid>
        <EvenGrid item xs={4}>
          <Typography>Angle</Typography>
        </EvenGrid>
        <EvenGrid item xs={8}>
          <Typography>
            {selected.angle.toFixed()}
          </Typography>
        </EvenGrid>
      </GridContainer>
    )
  }

  render() {


    return (
      <Rnd
        className={this.props.className}
        enableResizing={{}}
        dragHandleClassName='.Info__title'
      >
        <ScrollablePaper>
          <TitleDiv className='Info__title'>
            <InfoIcon/>
            {/* プラスアイコンを右端に配置するためのスタイル */}
            <TitleTypography variant="subtitle1" color="inherit">
              Rail Info
            </TitleTypography>
          </TitleDiv>
          <ContentDiv>
            {this.renderContent()}
          </ContentDiv>
        </ScrollablePaper>
      </Rnd>
    )
  }
}

