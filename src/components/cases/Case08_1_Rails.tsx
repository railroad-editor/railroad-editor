import * as React from "react";
import {Point} from "paper";
import {Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import {ArcDirection} from "components/rails/parts/primitives/ArcPart";
import StraightRail from "components/rails/StraightRail/StraightRail";
import CurveRail from "components/rails/CurveRail/CurveRail";
import SimpleTurnout from "components/rails/SimpleTurnout/SimpleTurnout";
// import {CurveRail} from "components/Rails/CurveRail";
// import StraightRail from "components/rails/StraightRail";
// import CurveRail from "components/rails/CurveRail";
// import SimpleTurnout from "components/rails/SimpleTurnout";

export default class Case08 extends React.Component<any, any> {
  r: any
  pivotJoint: number

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      pivotJoint: 0,
      position: new Point(200,200),
    }
  }

  componentDidMount() {
    // this.p = 1
    // this.forceUpdate()
  }

  render() {
    const matrix = {
      sx: 0, // scale center x
      sy: 0, // scale center y
      tx: 0, // translate x
      ty: 0, // translate y
      x: 0,
      y: 0,
      zoom: 1
    };


    return (
      <View width={800}
            height={600}
            matrix={matrix}
            settings={{
              applyMatrix: false
            }}
      >
        {createGridLines(800, 600, 100)}


        <StraightRail
          position={this.state.position}
          pivotJointIndex={this.state.pivotJoint}
          length={200}
          angle={30}
          id={0}
          layerId={1}
        />

        <CurveRail
          position={this.state.position}
          pivotJointIndex={this.state.pivotJoint}
          angle={30}
          radius={200}
          centerAngle={45}
          id={0}
          layerId={1}
        />

        <SimpleTurnout
          position={this.state.position}
          pivotJointIndex={this.state.pivotJoint}
          branchDirection={ArcDirection.RIGHT}
          angle={210}
          length={140}
          radius={280}
          centerAngle={30}
          id={0}
          layerId={1}
          fillColors={{1: 'blue'}}
        />

        <Tool
          active={true}
          onMouseDown={(e) => {
            switch (this.state.count) {
              case 0:
                this.setState({
                  count: this.state.count + 1,
                  position: new Point(300, 200),
                  pivotJoint: 1,
                })
                break
              case 1:
                this.setState({
                  count: this.state.count + 1,
                  pivotJoint: 0,
                })
                break
              case 2:
                this.setState({
                  count: this.state.count + 1,
                  pivotJoint: 1,
                })
                break
            }
          }}
        />
      </View>
    )
  }
}
