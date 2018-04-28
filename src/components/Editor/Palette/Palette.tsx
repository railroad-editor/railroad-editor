import * as React from 'react'
import builderPaletteData from "constants/builderPaletteItems.json"
import {Tools} from "constants/tools";
import StraightRailIcon from '../ToolBar/Icon/StraightRailIcon'
import CurveRailIcon from '../ToolBar/Icon/CurveRailIcon'
import TurnoutIcon from "../ToolBar/Icon/TurnoutIcon";
import SpecialRailIcon from "components/Editor/ToolBar/Icon/SpecialRailIcon";
import RailGroupIcon from "components/Editor/ToolBar/Icon/RailGroupIcon";
import BuilderPalette from "./BuilderPalette"
import Rnd from "react-rnd"
import {UserRailGroupData} from "reducers/builder";
import CustomStraightRailDialog from "components/Editor/Palette/BuilderPalette/CustomStraightRailDialog";
import CustomCurveRailDialog from "components/Editor/Palette/BuilderPalette/CustomCurveRailDialog";


export interface PaletteProps {
  className?: string
  tool: Tools
  setPaletteMode: (mode: string) => void
  userRailGroups: UserRailGroupData[]
  userCustomRails: any
}

export interface PaletteState {
  customDialogOpen: boolean
}


export default class Palette extends React.Component<PaletteProps, PaletteState> {

  constructor(props: PaletteProps) {
    super(props)
    this.state = {
      customDialogOpen: false
    }
  }

  isActive = (tool: string) => {
    return this.props.tool === tool
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
    const customStraightRails = this.props.userCustomRails.filter(c => c.paletteName === Tools.STRAIGHT_RAILS)
    const customCurveRails = this.props.userCustomRails.filter(c => c.paletteName === Tools.CURVE_RAILS)

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
              open={this.isActive(Tools.STRAIGHT_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
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
              open={this.isActive(Tools.CURVE_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
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
          items={this.props.userRailGroups.map(rg => {
            return {name: rg.name, type: 'RailGroup'}
          })}
        />
      </Rnd>
    )
  }
}

