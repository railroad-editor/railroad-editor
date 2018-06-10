import * as React from 'react'
import {ReactEventHandler} from 'react'
import {CardContent, CardHeader, MenuItem} from '@material-ui/core'
import Typography from "@material-ui/core/Typography";
import {S3Image} from 'aws-amplify-react';
import getLogger from "logging";
import * as moment from "moment";
import Menu from "@material-ui/core/Menu";
import Button from "@material-ui/core/Button";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import styled from "styled-components";
import IconButton from "@material-ui/core/IconButton";
import Card from "@material-ui/core/Card";
import {PowerPackData} from "store/layoutStore";

const LOGGER = getLogger(__filename)


export interface PowerPackCardProps {
  item: PowerPackData
  onSetting: (item: PowerPackData) => void
  onDelete: (item: PowerPackData) => void
}

export interface PowerPackCardState {
  anchorEl: HTMLElement
}


export class PowerPackCard extends React.Component<PowerPackCardProps, PowerPackCardState> {

  constructor(props: PowerPackCardProps) {
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

  onSetting = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onSetting(this.props.item)
    this.onMenuClose(e)
  }

  onDelete = (e: React.MouseEvent<HTMLElement>) => {
    this.props.onDelete(this.props.item)
    this.onMenuClose(e)
  }

  render() {
    const {name} = this.props.item
    return (
      <>
        <Card>
          <CardHeader
            title={name}
            action={
              <IconButton
                onClick={this.openMenu}
              >
                <MoreVertIcon/>
              </IconButton>
            }
            style={{paddingTop: '16px', paddingBottom: '8px'}}
          />
          <CardContent>
          </CardContent>
        </Card>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.onMenuClose}
        >
          <MenuItem onClick={this.onSetting}>Setting</MenuItem>}
          <MenuItem onClick={this.onDelete}>Delete</MenuItem>}
        </Menu>
      </>
    )
  }
}

