import * as React from "react";
import {ReactEventHandler} from "react";
import {
  ActiveListItemProps,
  SecondaryColorActiveListItem
} from "components/common/ActiveListItem";
import {ListItemText, MenuItem} from "material-ui";
import Menu from "material-ui/Menu";
import IconButton from "material-ui/IconButton";
import MoreVertIcon from 'material-ui-icons/MoreVert';


export interface LayerListItemProps extends ActiveListItemProps {
  text: string
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

    this.onMenuClose = this.onMenuClose.bind(this)
  }

  openMenu = (e: React.MouseEvent<HTMLElement>) => {
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
    const {text, onRename, onDelete, isDeletable, ...otherProps} = this.props

    return (
      <>
        <SecondaryColorActiveListItem
          {...otherProps as any}
        >
          <ListItemText primary={text}/>
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
        </SecondaryColorActiveListItem>
        <Menu
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


