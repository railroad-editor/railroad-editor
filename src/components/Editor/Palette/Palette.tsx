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
import CustomStraightRailDialog
  from "components/Editor/Palette/BuilderPalette/CustomStraightRailDialog/CustomStraightRailDialog";
import CustomCurveRailDialog
  from "components/Editor/Palette/BuilderPalette/CustomCurveRailDialog/CustomCurveRailDialog";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import NewRailGroupDialog from "components/Editor/Palette/BuilderPalette/NewRailGroupDialog/NewRailGroupDialog";
import {compose} from "recompose";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {LayoutStore} from "store/layoutStore";
import {withSnackbar} from 'material-ui-snackbar-provider'
import Tooltip from "material-ui/Tooltip";



export interface PaletteProps {
  className?: string
  tool: Tools
  builder?: BuilderStore
  layout?: LayoutStore
  addUserRailGroup: any
  snackbar: any
}

export interface PaletteState {
  customDialogOpen: boolean
}

type EnhancedPaletteProps = PaletteProps & WithBuilderPublicProps



@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export class Palette extends React.Component<EnhancedPaletteProps, PaletteState> {

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
      this.props.snackbar.showMessage(`Please select at least one rail.`)  //`
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
      .map(rg => { return {name: rg.name, type: 'RailGroup'} })
    const clipboard = this.props.builder.userRailGroups
      .filter(rg => rg.name === 'Clipboard')
      .map(rg => { return {name: rg.name, type: 'RailGroup'} })

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
          tooltipTitle={'Add Custom Straight Rail'}
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
          tooltipTitle={'Add Custom Curve Rail'}
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
          items={clipboard}
          customItems={customRailGroups}
          customDialog={
            <NewRailGroupDialog
              title={'New Rail Group'}
              open={this.isActive(Tools.RAIL_GROUPS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRailGroup={this.props.builderRegisterRailGroup}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Rail Group'}
        />
      </Rnd>
    )
  }
}


export default compose<PaletteProps, EnhancedPaletteProps>(
  withBuilder,
  withSnackbar()
)(Palette)

