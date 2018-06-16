import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {LayoutStore, PowerPackData} from "store/layoutStore";
import {PowerPackCard} from "components/Editor/SimulatorPalettes/PowerPackPalette/PowerPackCard/PowerPackCard";
import PowerPackSettingDialog
  from "components/Editor/SimulatorPalettes/PowerPackPalette/PowerPackSettingDialog/PowerPackSettingDialog";

export interface PowerPackListProps {
  items: PowerPackData[]
  layout?: LayoutStore
}

export interface PowerPackListState {
  settingDialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export default class PowerPackList extends React.Component<PowerPackListProps, PowerPackListState> {

  constructor(props: PowerPackListProps) {
    super(props)
    this.state = {
      settingDialogOpen: false
    }
  }

  onPowerChange = (id: number) => (power: number) => {
    this.props.layout.updatePowerPack({
      id,
      power
    })
  }

  onDirectionChange = (id: number) => (direction: boolean) => {
    this.props.layout.updatePowerPack({
      id,
      direction
    })

  }

  onSetting = (id: number) => (item: PowerPackData) => {
    this.setState({
      settingDialogOpen: true
    })
  }

  onSettingDialogClosed = () => {
    this.setState({
      settingDialogOpen: false
    })
  }


  onDelete = (id: number) => (item: PowerPackData) => {
    this.props.layout.deletePowerPack({
      id
    })
  }

  render() {
    const {items} = this.props
    return (
      <>
        {
          items.map((item, index) => {
            return (
              <>
              <PowerPackCard
                item={item}
                feeders={this.props.layout.currentLayoutData.feeders}
                onDelete={this.onDelete(item.id)}
                onSetting={this.onSetting(item.id)}
                onPowerChange={this.onPowerChange(item.id)}
                onDirectionChange={this.onDirectionChange(item.id)}
              />
                <PowerPackSettingDialog
                  title={'Power Pack Settings'}
                  open={this.state.settingDialogOpen}
                  onClose={this.onSettingDialogClosed}
                  powerPack={item}
                  updatePowerPack={this.props.layout.updatePowerPack}
                />
                </>
            )
          })}

      </>
    )
  }
}

