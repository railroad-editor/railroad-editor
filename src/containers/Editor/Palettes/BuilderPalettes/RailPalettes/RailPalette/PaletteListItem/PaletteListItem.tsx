import * as React from 'react'
import {Avatar, ListItemAvatar, ListItemText, MenuItem} from '@material-ui/core'
import {ActiveListItem} from "components/ActiveListItem/ActiveListItem";
import Menu from "@material-ui/core/Menu";
import {PaletteListItemSettingButton} from "components/PaletteListItemSettingButton/PaletteListItemSettingButton";
import {PaletteItem} from "stores";
import styled from "styled-components";
import {amber} from "@material-ui/core/colors";

const SmallListItemAvatar = styled(ListItemAvatar)`
  && {
    min-width: 34px;
  }
`

const SmallAvatar = styled(Avatar)`
  && {
    width: 22px;
    height: 22px;
    font-size: 0.8rem;
    background-color: ${amber[400]};
    color: black;
  }
`


export type PaletteListItemProps = {
  item: PaletteItem
  paletteItem: PaletteItem
  selectItem: any
  hasMenu?: boolean
  onDelete?: (item: PaletteItem) => void
  avatarIconLetter: string
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
    const {item, paletteItem, hasMenu, avatarIconLetter} = this.props

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
          <SmallListItemAvatar>
            <SmallAvatar>{avatarIconLetter}</SmallAvatar>
          </SmallListItemAvatar>
          <ListItemText primary={item.name}/>
          {menuButton}
        </ActiveListItem>
        {menu}
      </>
    )
  }
}
