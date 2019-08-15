import * as React from 'react'
import {Tools} from "constants/tools";
import StraightRailIcon from 'components/Editor/ToolBar/Icon/StraightRailIcon'
import CurveRailIcon from 'components/Editor/ToolBar/Icon/CurveRailIcon'
import TurnoutIcon from "components/Editor/ToolBar/Icon/TurnoutIcon";
import SpecialRailIcon from "components/Editor/ToolBar/Icon/SpecialRailIcon";
import RailGroupIcon from "components/Editor/ToolBar/Icon/RailGroupIcon";
import RailPalette from "./RailPalette/RailPalette"
import Rnd from "react-rnd"
import CustomStraightRailDialog
  from "components/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/CustomStraightRailDialog/CustomStraightRailDialog";
import CustomCurveRailDialog
  from "components/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/CustomCurveRailDialog/CustomCurveRailDialog";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT, STORE_UI} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import NewRailGroupDialog
  from "components/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/NewRailGroupDialog/NewRailGroupDialog";
import {compose} from "recompose";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {LayoutStore} from "store/layoutStore";
import {UiStore} from "../../../../../store/uiStore";


export interface PaletteProps {
  className?: string
  builder?: BuilderStore
  layout?: LayoutStore
  ui?: UiStore
}

export interface PaletteState {
  customDialogOpen: boolean
}

type EnhancedPaletteProps = PaletteProps & WithBuilderPublicProps


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_UI)
@observer
export class RailPalettes extends React.Component<EnhancedPaletteProps, PaletteState> {

  constructor(props: EnhancedPaletteProps) {
    super(props)
    this.state = {
      customDialogOpen: false
    }
  }

  isActive = (tool: string) => {
    return this.props.builder.activeTool === tool
  }

  openCustomDialog = () => {
    if (this.props.layout.selectedRails.length === 0 && this.isActive(Tools.RAIL_GROUPS)) {
      this.props.ui.setNoRailForGroupSnackbar(true)
      return
    }
    this.setState({
      customDialogOpen: true
    })
  }

  closeCustomDialog = () => {
    this.setState({
      customDialogOpen: false
    })
  }


  render() {
    const customStraightRails = this.props.builder.userRails.filter(c => c.paletteName === Tools.STRAIGHT_RAILS)
    const customCurveRails = this.props.builder.userRails.filter(c => c.paletteName === Tools.CURVE_RAILS)
    const customRailGroups = this.props.builder.userRailGroups
      .filter(rg => rg.name !== 'Clipboard')
      .map(rg => {
        return {name: rg.name, type: 'RailGroup'}
      })
    const clipboard = this.props.builder.userRailGroups
      .filter(rg => rg.name === 'Clipboard')
      .map(rg => {
        return {name: rg.name, type: 'RailGroup'}
      })

    return (
      <Rnd
        className={this.props.className}
        dragHandleClassName='.Palette__title'
      >
        <RailPalette
          active={this.isActive(Tools.STRAIGHT_RAILS)}
          icon={<StraightRailIcon/>}
          title={Tools.STRAIGHT_RAILS}
          items={this.props.builder.presetRailPaletteItems[Tools.STRAIGHT_RAILS]}
          customItems={customStraightRails}
          customDialog={
            <CustomStraightRailDialog
              title={'Custom Straight Rail'}
              open={this.isActive(Tools.STRAIGHT_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRail={this.props.builder.addUserRail}
              definedItems={this.props.builder.presetRailPaletteItems[Tools.STRAIGHT_RAILS].concat(customStraightRails)}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Custom Straight Rail'}
          helpMessage={'Click + to add a custom straight rail.'}
        />
        <RailPalette
          active={this.isActive(Tools.CURVE_RAILS)}
          icon={<CurveRailIcon/>}
          title={Tools.CURVE_RAILS}
          items={this.props.builder.presetRailPaletteItems[Tools.CURVE_RAILS]}
          customItems={customCurveRails}
          customDialog={
            <CustomCurveRailDialog
              title={'Custom Curve Rail'}
              open={this.isActive(Tools.CURVE_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRail={this.props.builder.addUserRail}
              definedItems={this.props.builder.presetRailPaletteItems[Tools.CURVE_RAILS].concat(customStraightRails)}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Custom Curve Rail'}
          helpMessage={'Click + to add a custom curve rail.'}
        />
        <RailPalette
          active={this.isActive(Tools.TURNOUTS)}
          icon={<TurnoutIcon/>}
          title={Tools.TURNOUTS}
          items={this.props.builder.presetRailPaletteItems[Tools.TURNOUTS]}
        />
        <RailPalette
          active={this.isActive(Tools.SPECIAL_RAILS)}
          icon={<SpecialRailIcon/>}
          title={Tools.SPECIAL_RAILS}
          items={this.props.builder.presetRailPaletteItems[Tools.SPECIAL_RAILS]}
        />
        <RailPalette
          active={this.isActive(Tools.RAIL_GROUPS)}
          icon={<RailGroupIcon/>}
          title={Tools.RAIL_GROUPS}
          items={clipboard}
          customItems={customRailGroups}
          customDialog={
            <NewRailGroupDialog
              title={'New Rail Group'}
              open={this.isActive(Tools.RAIL_GROUPS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRailGroup={this.props.builderRegisterRailGroup}
              definedItems={customRailGroups}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Rail Group'}
          helpMessage={'To add a new rail group, select rails and click + button.'}
        />
      </Rnd>
    )
  }
}


export default compose<PaletteProps, EnhancedPaletteProps | any>(
  withBuilder,
)(RailPalettes)

