import * as React from 'react'
import {List, ListItemText, MenuItem} from '@material-ui/core'
import {PrimaryColorActiveListItem} from "components/common/ActiveListItem/index";
import IconButton from "@material-ui/core/IconButton";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from "@material-ui/core/Menu";

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
    this.setState({ anchorEl: e.currentTarget });
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
        <IconButton
          style={{
            width: '20px',
            height: '20px',
            fontSize: '20px'
          }}
          onClick={this.openMenu}
        >
          <MoreVertIcon
            style={{
              fontSize: '20px'
            }}
          />
        </IconButton>
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
