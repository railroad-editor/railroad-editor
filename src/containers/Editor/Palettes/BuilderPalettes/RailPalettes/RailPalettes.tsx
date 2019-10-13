import * as React from 'react'
import {Tools} from "constants/tools";
import StraightRailIcon from 'containers/Editor/ToolBar/Icon/StraightRailIcon'
import CurveRailIcon from 'containers/Editor/ToolBar/Icon/CurveRailIcon'
import TurnoutIcon from "containers/Editor/ToolBar/Icon/TurnoutIcon";
import SpecialRailIcon from "containers/Editor/ToolBar/Icon/SpecialRailIcon";
import RailGroupIcon from "containers/Editor/ToolBar/Icon/RailGroupIcon";
import RailPalette from "./RailPalette/RailPalette"
import Rnd from "react-rnd"
import CustomStraightRailDialog
  from "containers/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/CustomStraightRailDialog/CustomStraightRailDialog";
import CustomCurveRailDialog
  from "containers/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/CustomCurveRailDialog/CustomCurveRailDialog";
import {inject, observer} from "mobx-react";
import NewRailGroupDialog
  from "containers/Editor/Palettes/BuilderPalettes/RailPalettes/RailPalette/NewRailGroupDialog/NewRailGroupDialog";
import {NO_RAIL_FOR_GROUP} from "constants/messages";
import {I18n} from "aws-amplify";
import {WithBuilderStore, WithLayoutStore, WithUiStore} from "stores";
import {WithRailToolUseCase, WithSelectionToolUseCase} from "useCases";
import {STORE_BUILDER, STORE_LAYOUT, STORE_UI} from "constants/stores";
import {USECASE_RAIL_TOOL, USECASE_SELECTION} from "constants/useCases";


export type RailPaletteProps = {
  className?: string
} & WithBuilderStore & WithLayoutStore & WithUiStore & WithRailToolUseCase & WithSelectionToolUseCase

export interface RailPaletteState {
  customDialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_UI, USECASE_RAIL_TOOL, USECASE_SELECTION)
@observer
export default class RailPalettes extends React.Component<RailPaletteProps, RailPaletteState> {

  constructor(props: RailPaletteProps) {
    super(props)
    this.state = {
      customDialogOpen: false
    }
  }

  isActive = (tool: string) => {
    return this.props.builder.activeTool === tool
  }

  openCustomDialog = () => {
    this.setState({
      customDialogOpen: true
    })
  }

  openRailGroupDialog = (e) => {
    if (this.props.layout.selectedRails.length > 0) {
      this.setState({
        customDialogOpen: true
      })
    } else {
      this.props.ui.setCommonSnackbar(true, I18n.get(NO_RAIL_FOR_GROUP), 'warning')
    }
  }

  closeCustomDialog = () => {
    this.setState({
      customDialogOpen: false
    })
  }

  addUserRailGroup = (name: string) => {
    this.props.railToolUseCase.registerSelectedRailsAsRailGroup(name)
    this.props.selectionToolUseCase.selectAllRails(false)
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

    const presetRailItems = Object.keys(this.props.builder.presetRailPaletteItems)
      .map(key => this.props.builder.presetRailPaletteItems[key])
      .flat()
    const allRailItems = [].concat(presetRailItems, customStraightRails, customCurveRails, customRailGroups)

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
              definedItems={allRailItems}
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
              definedItems={allRailItems}
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
              addUserRailGroup={this.addUserRailGroup}
              definedItems={allRailItems}
            />
          }
          openCustomDialog={this.openRailGroupDialog}
          tooltipTitle={'Add Rail Group'}
          helpMessage={'To add a new rail group, select rails and click + button.'}
        />
      </Rnd>
    )
  }
}

