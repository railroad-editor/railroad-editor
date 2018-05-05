import * as React from "react";
import {ReactEventHandler} from "react";
import {
  ActiveListItemProps,
  SecondaryColorActiveListItem
} from "components/common/ActiveListItem";
import {MenuItem} from "material-ui";
import Menu from "material-ui/Menu";


export interface LayerListItemProps extends ActiveListItemProps {
  onRename: ReactEventHandler<HTMLElement>
  onDelete: ReactEventHandler<HTMLElement>
  isDeletable: boolean
}

export interface LayerListItemState {
  anchorEl: HTMLElement
}

export class LayerListItem extends React.Component<LayerListItemProps, LayerListItemState> {

  constructor(props) {
    super(props)
    this.state = {
      anchorEl: null
    }

    this.onMenuOpen = this.onMenuOpen.bind(this)
    this.onMenuClose = this.onMenuClose.bind(this)
  }

  onMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({ anchorEl: e.currentTarget });
  }

  onMenuClose = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({anchorEl: null})
  }

  onRename = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onRename(e)
    this.onMenuClose(e)
  }

  onDelete = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onDelete(e)
    this.onMenuClose(e)
  }

  render () {
    const {children, onRename, onDelete, isDeletable, ...otherProps} = this.props

    return (
      <>
        <SecondaryColorActiveListItem
          {...otherProps as any}
          onContextMenu={this.onMenuOpen}
        >
          {children}
        </SecondaryColorActiveListItem>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.onMenuClose}
        >
          <MenuItem onClick={this.onRename}>Setting</MenuItem>
          {isDeletable && <MenuItem onClick={this.onDelete}>Delete</MenuItem>}
        </Menu>
      </>
    )
  }
}


