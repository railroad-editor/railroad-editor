import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_BUILDER} from "constants/stores";
import {PowerPackData} from "store/layoutStore";
import {PowerPackCard} from "components/Editor/Palette/PowerPackPalette/PowerPackCard/PowerPackCard";

export interface PowerPackListProps {
  items: PowerPackData[]
}


@inject(STORE_BUILDER)
@observer
export default class PowerPackList extends React.Component<PowerPackListProps, {}> {

  constructor(props: PowerPackListProps) {
    super(props)
  }

  onSetting = (item: PowerPackData) => {

  }

  onDelete = (item: PowerPackData) => {
  }

  render() {
    const {items} = this.props
    return (
      <>
        {
          items.map((item, index) => {
            return (
              <PowerPackCard
                item={item}
                onDelete={this.onDelete}
                onSetting={this.onSetting}
              />
            )
          })}
      </>
    )
  }
}

