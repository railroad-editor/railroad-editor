import * as React from 'react'
import {ReactEventHandler} from 'react'
import {MenuItem} from "material-ui"
import Typography from "material-ui/Typography";
import {S3Image} from 'aws-amplify-react';
import getLogger from "logging";
import * as moment from "moment";
import Menu from "material-ui/Menu";
import {StyledCardContent} from "components/Editor/MenuDrawer/OpenLayoutDialog/LayoutCard/style";
import Button from "material-ui/Button";

const LOGGER = getLogger(__filename)

export interface LayoutCardProps {
  imgKey: string
  title: string
  lastModified: number
  onClick: ReactEventHandler<HTMLElement>
  onRename: ReactEventHandler<HTMLElement>
  onDelete: ReactEventHandler<HTMLElement>
}

export interface LayoutCardState {
  anchorEl: HTMLElement
}


export class LayoutCard extends React.Component<LayoutCardProps, LayoutCardState> {

  constructor(props: LayoutCardProps) {
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

  render() {
    const {imgKey, title, lastModified} = this.props
    return (
      <React.Fragment>
        <Button
          onClick={this.props.onClick}
          onContextMenu={this.onMenuOpen}
        >
          <StyledCardContent
          >
            <S3Image level={'private'} imgKey={imgKey}/>
            <Typography align="left" variant="body2">
              Title: {title}
            </Typography>
            <Typography align="left" variant="body2">
              Last modified: {moment(lastModified).format('MMMM Do YYYY, hh:mm:ss')}
            </Typography>
          </StyledCardContent>
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.onMenuClose}
        >
          {/*<MenuItem onClick={this.onRename}>Rename</MenuItem>*/}
          <MenuItem onClick={this.onDelete}>Delete</MenuItem>}
        </Menu>
      </React.Fragment>
    )
  }
}

