import * as React from 'react'
import InfoIcon from '@material-ui/icons/Info';
import {Grid} from '@material-ui/core'
import {ContentDiv, EvenGrid, GridContainer, OddGrid, ScrollablePaper} from "./InfoPalette.style";
import Rnd from 'react-rnd'
import {inject, observer} from "mobx-react";
import {TitleDiv, TitleTypography} from "containers/Editor/Palettes/Palettes.style";
import Typography from "@material-ui/core/Typography";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {RailData, RailGroupData, WithBuilderStore, WithLayoutStore} from "stores";
import RailComponentRegistry from "containers/rails/RailComponentRegistry";
import RailIcon from "components/RailIcon/RailIcon";
import RailGroupIcon from "components/RailIcon/RailGroupIcon"


export type InfoPaletteProps = {
  className?: string
} & WithLayoutStore & WithBuilderStore


@inject(STORE_LAYOUT, STORE_BUILDER)
@observer
export default class InfoPalette extends React.Component<InfoPaletteProps, {}> {

  renderSelectedRailsInfo = (rails) => {
    return (
      <GridContainer container spacing={1}>
        <Grid item xs={12}>
          <Typography>
            {rails.length} rails are selected
          </Typography>
        </Grid>
      </GridContainer>
    )
  }

  renderSelectedRailInfo = (rail) => {
    return (
      <GridContainer container justify="center" spacing={1}>
        <OddGrid item xs={4}>
          <Typography>Name</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <Typography>
            {rail.name}
          </Typography>
        </OddGrid>
        <EvenGrid item xs={4}>
          <Typography>Type</Typography>
        </EvenGrid>
        <EvenGrid item xs={8}>
          <Typography>
            {rail.type}
          </Typography>
        </EvenGrid>
        <OddGrid item xs={4}>
          <Typography>Position</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <Typography>
            ({rail.position.x.toFixed()}, {rail.position.y.toFixed()})
          </Typography>
        </OddGrid>
        <EvenGrid item xs={4}>
          <Typography>Angle</Typography>
        </EvenGrid>
        <EvenGrid item xs={8}>
          <Typography>
            {rail.angle.toFixed()}
          </Typography>
        </EvenGrid>
      </GridContainer>
    )
  }

  renderPaletteRailInfo = (itemData: RailData) => {
    return (
      <GridContainer container alignItems="center" spacing={1}>
        <OddGrid item xs={4}>
          <Typography>Name</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <Typography>
            {itemData.name}
          </Typography>
        </OddGrid>
        <OddGrid item xs={4}>
          <Typography>Preview</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <RailIcon width={110} height={90} rail={RailComponentRegistry.createRailComponent(itemData)} zoom={0.4}/>
        </OddGrid>
      </GridContainer>
    )
  }

  renderPaletteRailGroupInfo = (itemData: RailGroupData) => {
    if (this.props.builder.paletteRailGroupData) {
      itemData = this.props.builder.paletteRailGroupData
    } else {
      return
    }
    return (
      <GridContainer container alignItems="center" spacing={1}>
        <OddGrid item xs={4}>
          <Typography>Name</Typography>
        </OddGrid>
        <OddGrid item xs={8}>
          <Typography>
            {itemData.name}
          </Typography>
        </OddGrid>
        <OddGrid item xs={12}>
          <RailGroupIcon width={110} height={90} railGroup={RailComponentRegistry.createRailGroupComponent(itemData)}
                         zoom={0.3}/>
        </OddGrid>
      </GridContainer>
    )
  }

  renderNoInfo = () => {
    return (
      <GridContainer container spacing={1}>
        <Grid item xs={12}>
          <Typography>Select any rail</Typography>
        </Grid>
      </GridContainer>
    )
  }


  renderContent = () => {
    const selectedRails = this.props.layout.selectedRails

    if (selectedRails.length === 0) {
      const paletteItem = this.props.builder.paletteItem
      const railData = this.props.builder.getRailItemData(paletteItem.name)
      if (railData) {
        return this.renderPaletteRailInfo(railData)
      }
      const railGroupData = this.props.builder.getRailGroupItemData(paletteItem.name)
      if (railGroupData) {
        return this.renderPaletteRailGroupInfo(railGroupData)
      }
      return this.renderNoInfo()
    }

    if (selectedRails.length === 1) {
      const selected = selectedRails[0]
      return this.renderSelectedRailInfo(selected)
    }
    // multiple rails selected
    return this.renderSelectedRailsInfo(selectedRails)
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

