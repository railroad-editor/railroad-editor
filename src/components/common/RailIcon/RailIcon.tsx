import * as React from 'react'
import {ListItemProps} from "@material-ui/core/ListItem";
import {View} from "react-paper-bindings";

export interface RailIconProps extends ListItemProps {
  width: number
  height: number
  rail: any
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

  _ref: any
  _rail: any

  componentDidMount() {
    // this._ref.paper.activate()
    const rect = this._rail.railPart.path.bounds

    // const r = new Path.Rectangle(rect)
    // const position = this._ref.paper.view.projectToView(new Point(this.props.width, this.props.height))
    const zoom = Math.min(this.props.height / rect.height, this.props.width / rect.width) - 0.01
    // console.info(rect)
    this.setState({
      zoom: zoom
    })
  }

  render() {
    const {width, height, rail} = this.props
    const matrix = {
      sx: width / 2, // scale center x
      sy: height / 2, // scale center y
      tx: 0, // translate x
      ty: 0, // translate y
      x: 0,
      y: 0,
      zoom: this.state.zoom
    };

    const extendedRail = React.cloneElement(rail as any, {
      ...rail.props,
      position: {x: width / 2, y: height / 2},
      enableJoints: false,
      pivotJointIndex: undefined,
      ref: (r) => {
        if (r) this._rail = r
        // Call the original ref, if any
        const {ref} = rail;
        if (typeof ref === 'function') {
          ref(r);
        }
      }
    })

    return (
      <View width={width}
            height={height}
            matrix={matrix}
            settings={{
              applyMatrix: false
            }}
            ref={(v) => {
              if (v) this._ref = v
            }}
      >
        {extendedRail}
      </View>
    )
  }
}

