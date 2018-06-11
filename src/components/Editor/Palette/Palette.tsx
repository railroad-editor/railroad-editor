import * as React from 'react'
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
import PowerPackPalette from './PowerPackPalette/PowerPackPalette';


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
          items={this.props.builder.presetPaletteItems[Tools.STRAIGHT_RAILS]}
          customItems={customStraightRails}
          customDialog={
            <CustomStraightRailDialog
              title={'Custom Straight Rail'}
              open={this.isActive(Tools.STRAIGHT_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRail={this.props.builder.addUserRail}
              definedItems={this.props.builder.presetPaletteItems[Tools.STRAIGHT_RAILS].concat(customStraightRails)}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Custom Straight Rail'}
          helpMessage={'Click + to add a custom straight rail.'}
        />
        <BuilderPalette
          active={this.isActive(Tools.CURVE_RAILS)}
          icon={<CurveRailIcon/>}
          title={Tools.CURVE_RAILS}
          items={this.props.builder.presetPaletteItems[Tools.CURVE_RAILS]}
          customItems={customCurveRails}
          customDialog={
            <CustomCurveRailDialog
              title={'Custom Curve Rail'}
              open={this.isActive(Tools.CURVE_RAILS) && this.state.customDialogOpen}
              onClose={this.closeCustomDialog}
              addUserRail={this.props.builder.addUserRail}
              definedItems={this.props.builder.presetPaletteItems[Tools.CURVE_RAILS].concat(customStraightRails)}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Custom Curve Rail'}
          helpMessage={'Click + to add a custom curve rail.'}
        />
        <BuilderPalette
          active={this.isActive(Tools.TURNOUTS)}
          icon={<TurnoutIcon/>}
          title={Tools.TURNOUTS}
          items={this.props.builder.presetPaletteItems[Tools.TURNOUTS]}
        />
        <BuilderPalette
          active={this.isActive(Tools.SPECIAL_RAILS)}
          icon={<SpecialRailIcon/>}
          title={Tools.SPECIAL_RAILS}
          items={this.props.builder.presetPaletteItems[Tools.SPECIAL_RAILS]}
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
              definedItems={customRailGroups}
            />
          }
          openCustomDialog={this.openCustomDialog}
          tooltipTitle={'Add Rail Group'}
          helpMessage={'To add a new rail group, select rails and click + button.'}
        />

        <PowerPackPalette
          active={this.isActive(Tools.SIMULATOR)}
          items={this.props.layout.currentLayoutData.powerPacks}
          helpMessage={'Click + to add a power unit.'}
        />




      </Rnd>
    )
  }
}


export default compose<PaletteProps, EnhancedPaletteProps>(
  withBuilder,
  withSnackbar()
)(Palette)

