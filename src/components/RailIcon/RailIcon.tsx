import * as React from 'react'
import {ReactElement} from 'react'
import {ListItemProps} from "@material-ui/core/ListItem";
import {View as ViewComponent} from "react-paper-bindings";
import {Point, View} from "paper";
import {RailBase, RailBaseProps, RailBaseState} from "react-rail-components";

export interface RailIconProps extends ListItemProps {
  width: number
  height: number
  rail: ReactElement<RailBase<RailBaseProps, RailBaseState>>
  zoom?: number
}

export interface RailIconState {
  zoom: number
}


export default class RailIcon extends React.Component<RailIconProps, RailIconState> {

  constructor(props) {
    super(props)
    this.state = {
      zoom: 1
    }
  }

  private _view: View
  private _rail: RailBase<any, any>

  componentDidMount() {
    this.setZoom()
  }

  setZoom = () => {
    const rect = this._rail.railPart.path.bounds
    const maxZoom = Math.min(this.props.height / rect.height, this.props.width / rect.width)
    let zoom
    if (this.props.zoom) {
      zoom = Math.min(this.props.zoom, maxZoom) - 0.01
    } else {
      zoom = maxZoom - 0.01
    }
    this._view.scale(zoom, new Point(this.props.width / 2, this.props.height / 2))
  }

  render() {
    const {width, height, rail} = this.props
    const extendedRail = React.cloneElement<RailBaseProps & any>(rail, {
      ...rail.props,
      id: 0,
      position: {x: width / 2, y: height / 2},
      pivotJointIndex: undefined,
      enableJoints: false,
      ref: (ref) => {
        if (ref) this._rail = ref
      }
    })

    return (
      <ViewComponent
        width={width}
        height={height}
        settings={{applyMatrix: false}}
        ref={this.getViewRef}
      >
        {extendedRail}
      </ViewComponent>
    )
  }

  private getViewRef = (ref) => {
    if (ref) this._view = ref.scope.view
  }
}

