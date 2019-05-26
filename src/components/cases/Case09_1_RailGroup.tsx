import * as React from "react";
import {Point} from "paper";
import {Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import StraightRail from "components/rails/StraightRail/StraightRail";
import RailGroup from "components/rails/RailGroup/RailGroup";
import CurveRail from "components/rails/CurveRail/CurveRail";
// import {CurveRail} from "components/Rails/CurveRail";
// import StraightRail from "components/rails/StraightRail";
// import CurveRail from "components/rails/CurveRail";
// import SimpleTurnout from "components/rails/SimpleTurnout";

export default class Case09 extends React.Component<any, any> {
  r: any
  pivotJoint: number
  group: RailGroup

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      pivotJoint: 0,
      position: new Point(200, 200),
    }
  }

  componentDidMount() {
    // this.p = 1
    // this.forceUpdate()
    this.group

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


        <RailGroup
          id={-1}
          position={new Point(300, 300)}
          angle={30}
          pivotJointInfo={{
            railId: 0,
            jointId: 1
          }}
          ref={(group) => this.group = group}
        >
          <StraightRail
            position={new Point(200, 150)}
            pivotJointIndex={0}
            length={200}
            angle={0}
            id={0}
            layerId={1}
          />
          <StraightRail
            position={new Point(200, 200)}
            pivotJointIndex={0}
            length={200}
            angle={0}
            id={0}
            layerId={1}
          />
          <CurveRail
            position={new Point(400, 200)}
            pivotJointIndex={0}
            angle={0}
            radius={200}
            centerAngle={45}
            id={0}
            layerId={1}
          />
        </RailGroup>


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
