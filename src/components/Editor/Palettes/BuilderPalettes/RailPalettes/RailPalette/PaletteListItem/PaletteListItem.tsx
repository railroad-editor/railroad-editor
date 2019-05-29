import * as React from 'react'
import {ListItemText, MenuItem} from '@material-ui/core'
import {PrimaryColorActiveListItem} from "components/common/ActiveListItem/index";
import Menu from "@material-ui/core/Menu";
import {PrimaryPaletteListItemSettingButton} from "../../../../../../common/PaletteListItemSettingButton/PaletteListItemSettingButton";

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
        <PrimaryPaletteListItemSettingButton onClick={this.openMenu}/>
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
        <PrimaryColorActiveListItem
          button
          active={item.name === paletteItem.name}
          onClick={this.handleClick}
        >
          <ListItemText primary={item.name}/>
          {menuButton}
        </PrimaryColorActiveListItem>
        {menu}
      </>
    )
  }
}
