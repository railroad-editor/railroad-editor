import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {LayoutStore, SwitcherData} from "store/layoutStore";

export interface SwitcherListProps {
  items: SwitcherData[]
  layout?: LayoutStore
}

export interface SwitcherListState {
  settingDialogOpen: boolean
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export default class SwitcherList extends React.Component<SwitcherListProps, SwitcherListState> {

  constructor(props: SwitcherListProps) {
    super(props)
    this.state = {
      settingDialogOpen: false
    }
  }

  onPowerChange = (id: number) => (power: number) => {
    this.props.layout.updateSwitcher({
      id,
      // power
    })
  }

  onDirectionChange = (id: number) => (direction: boolean) => {
    this.props.layout.updateSwitcher({
      id,
      // direction
    })

  }

  onSetting = (id: number) => (item: SwitcherData) => {
    this.setState({
      settingDialogOpen: true
    })
  }

  onSettingDialogClosed = () => {
    this.setState({
      settingDialogOpen: false
    })
  }


  onDelete = (id: number) => (item: SwitcherData) => {
    this.props.layout.deleteSwitcher({
      id
    })
  }

  render() {
    const {items} = this.props
    return (
      <>
        {/*{*/}
          {/*items.map((item, index) => {*/}
            {/*return (*/}
              {/*<>*/}
              {/*<SwitcherCard*/}
                {/*item={item}*/}
                {/*feeders={this.props.layout.currentLayoutData.feeders}*/}
                {/*onDelete={this.onDelete(item.id)}*/}
                {/*onSetting={this.onSetting(item.id)}*/}
                {/*onPowerChange={this.onPowerChange(item.id)}*/}
                {/*onDirectionChange={this.onDirectionChange(item.id)}*/}
              {/*/>*/}
                {/*<SwitcherSettingDialog*/}
                  {/*title={'Power Pack Settings'}*/}
                  {/*open={this.state.settingDialogOpen}*/}
                  {/*onClose={this.onSettingDialogClosed}*/}
                  {/*powerPack={item}*/}
                  {/*updateSwitcher={this.props.layout.updateSwitcher}*/}
                {/*/>*/}
                {/*</>*/}
            {/*)*/}
          {/*})}*/}
      </>
    )
  }
}

