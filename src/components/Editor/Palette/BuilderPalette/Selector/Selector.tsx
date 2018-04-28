import * as React from 'react'
import {List, ListItemText} from 'material-ui'
import {StyledListItem} from "./Selector.style";
import {PaletteItem} from "store/type";

export interface SelectorProps {
  items: PaletteItem[]
  paletteItem: PaletteItem
  selectItem: (item: PaletteItem) => void
}


export default class Selector extends React.Component<SelectorProps, {}> {

  constructor(props: SelectorProps) {
    super(props)
  }

  handleClick = (value: PaletteItem, e: React.MouseEvent<HTMLInputElement>) => {
    this.props.selectItem(value)
  }

  render() {
    return (
      <List>
        {this.props.items.map((value, index) => {
          return [
              <StyledListItem
                button
                active={this.props.paletteItem.name === value.name}
                // TODO: Performance issue?
                onClick={this.handleClick.bind(this, value)}
                key={index}
              >
                <ListItemText primary={value.name}/>
              </StyledListItem>
          ]
        })}
      </List>
    )
  }
}

