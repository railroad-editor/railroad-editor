import * as React from 'react'
import {ListItemText, MenuItem} from '@material-ui/core'
import {ActiveListItem} from "components/ActiveListItem/ActiveListItem";
import Menu from "@material-ui/core/Menu";
import {PaletteListItemSettingButton} from "../../../../../../../components/PaletteListItemSettingButton/PaletteListItemSettingButton";
import {PaletteItem} from "../../../../../../../store";

export interface PaletteListItemProps {
  item: PaletteItem
  paletteItem: PaletteItem
  selectItem: any
  hasMenu?: boolean
  onDelete?: (item: PaletteItem) => void
}

export interface PaletteListItemState {
  anchorEl: HTMLElement
}

export default class PaletteListItem extends React.Component<PaletteListItemProps, PaletteListItemState> {

  constructor(props: PaletteListItemProps) {
    super(props)
    this.state = {
      anchorEl: null
    }
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: e.currentTarget});
  }

  onMenuClose = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: null})
  }

  handleClick = (e) => {
    this.props.selectItem(this.props.item)
  }

  onDelete = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onDelete(this.props.item)
    this.onMenuClose(e)
  }

  render() {
    const {item, paletteItem, hasMenu} = this.props

    let menuButton, menu
    if (hasMenu) {
      menuButton = (
        <PaletteListItemSettingButton onClick={this.openMenu}/>
      )
      menu = (
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.onMenuClose}
        >
          <MenuItem onClick={this.onDelete}>Delete</MenuItem>
        </Menu>
      )
    }

    return (
      <>
        <ActiveListItem
          button
          active={item.name === paletteItem.name}
          onClick={this.handleClick}
          color="primary"
        >
          <ListItemText primary={item.name}/>
          {menuButton}
        </ActiveListItem>
        {menu}
      </>
    )
  }
}
