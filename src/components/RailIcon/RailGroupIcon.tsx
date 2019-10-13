import * as React from 'react'
import {ListItemProps} from "@material-ui/core/ListItem";
import {View as ViewComponent} from "react-paper-bindings";
import {Point, View} from "paper";
import {RailGroup, RailGroupProps} from "react-rail-components";

export interface RailGroupIconProps extends ListItemProps {
  width: number
  height: number
  railGroup: React.ReactElement<RailGroupProps>
  zoom?: number
}


export default class RailGroupIcon extends React.Component<RailGroupIconProps, {}> {

  constructor(props) {
    super(props)
  }

  private _view: View
  private _railGroup: RailGroup

  componentDidMount() {
    this.setZoom()
  }

  setZoom = () => {
    const rect = this._railGroup.group.bounds
    const maxZoom = Math.min(this.props.height / rect.height, this.props.width / rect.width)
    const zoom = Math.min(this.props.zoom, maxZoom) - 0.01
    this._view.scale(zoom, new Point(this.props.width / 2, this.props.height / 2))
  }

  render() {
    const {width, height, railGroup} = this.props
    const extendedRailGroup = React.cloneElement<RailGroupProps & any>(railGroup, {
      ...railGroup.props,
      id: 0,
      position: {x: width / 2, y: height / 2},
      enableJoints: false,
      ref: (ref) => {
        if (ref) this._railGroup = ref
      }
    })

    return (
      <ViewComponent
        width={width}
        height={height}
        settings={{applyMatrix: false}}
        ref={this.getViewRef}
      >
        {extendedRailGroup}
      </ViewComponent>
    )
  }

  private getViewRef = (ref) => {
    if (ref) this._view = ref.scope.view
  }
}

