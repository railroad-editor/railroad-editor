import * as React from 'react'
import builderPaletteData from "constants/builderPaletteItems.json"
import {Tools} from "constants/tools";
import StraightRailIcon from '../ToolBar/Icon/StraightRailIcon'
import CurveRailIcon from '../ToolBar/Icon/CurveRailIcon'
import TurnoutIcon from "../ToolBar/Icon/TurnoutIcon";
import SpecialRailIcon from "components/Editor/ToolBar/Icon/SpecialRailIcon";
import RailGroupIcon from "components/Editor/ToolBar/Icon/RailGroupIcon";
import BuilderPalette from "./BuilderPalette/BuilderPalette"
import Rnd from "react-rnd"
import {UserRailGroupData} from "reducers/builder";
import CustomStraightRailDialog from "components/Editor/Palette/BuilderPalette/CustomStraightRailDialog/CustomStraightRailDialog";
import CustomCurveRailDialog from "components/Editor/Palette/BuilderPalette/CustomCurveRailDialog/CustomCurveRailDialog";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import {RailItemData} from "components/rails";


export interface PaletteProps {
  className?: string
  tool: Tools
  builder?: BuilderStore
}

export interface PaletteState {
  customDialogOpen: boolean
}


@inject(STORE_BUILDER)
@observer
export default class Palette extends React.Component<PaletteProps, PaletteState> {

  constructor(props: PaletteProps) {
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

  closeCustomDialog = () => {
    this.setState({
      customDialogOpen: false
    })
  }


  render() {
    const customStraightRails = this.props.builder.userRails.filter(c => c.paletteName === Tools.STRAIGHT_RAILS)
    const customCurveRails = this.props.builder.userRails.filter(c => c.paletteName === Tools.CURVE_RAILS)

    return (
      <Rnd
        className={this.props.className}
        dragHandleClassName='.Palette__title'
      >
        <BuilderPalette
          active={this.isActive(Tools.STRAIGHT_RAILS)}
          icon={<StraightRailIcon/>}
          title={Tools.STRAIGHT_RAILS}
          items={builderPaletteData[Tools.STRAIGHT_RAILS]}
          customItems={customStraightRails}
          customDialog={
            <CustomStraightRailDialog
              title={'Custom Straight Rail'}
              open={this.isActive(Tools.STRAIGHT_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRail={this.props.builder.addUserRail}
            />
          }
          openCustomDialog={this.openCustomDialog}
        />
        <BuilderPalette
          active={this.isActive(Tools.CURVE_RAILS)}
          icon={<CurveRailIcon/>}
          title={Tools.CURVE_RAILS}
          items={builderPaletteData[Tools.CURVE_RAILS]}
          customItems={customCurveRails}
          customDialog={
            <CustomCurveRailDialog
              title={'Custom Curve Rail'}
              open={this.isActive(Tools.CURVE_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRail={this.props.builder.addUserRail}
            />
          }
          openCustomDialog={this.openCustomDialog}
        />
        <BuilderPalette
          active={this.isActive(Tools.TURNOUTS)}
          icon={<TurnoutIcon/>}
          title={Tools.TURNOUTS}
          items={builderPaletteData[Tools.TURNOUTS]}
        />
        <BuilderPalette
          active={this.isActive(Tools.SPECIAL_RAILS)}
          icon={<SpecialRailIcon/>}
          title={Tools.SPECIAL_RAILS}
          items={builderPaletteData[Tools.SPECIAL_RAILS]}
        />
        <BuilderPalette
          active={this.isActive(Tools.RAIL_GROUPS)}
          icon={<RailGroupIcon/>}
          title={Tools.RAIL_GROUPS}
          items={this.props.builder.userRailGroups.map(rg => {
            return {name: rg.name, type: 'RailGroup'}
          })}
        />
      </Rnd>
    )
  }
}

