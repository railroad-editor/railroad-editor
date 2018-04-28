import * as React from "react";
import {Point} from "paper";
import {Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import StraightRailPart from "components/rails/parts/StraightRailPart";
import CurveRailPart from "components/rails/parts/CurveRailPart";
import {ArcDirection} from "components/rails/parts/primitives//ArcPart";
import {pointsEqual} from "components/rails/utils";
import * as assert from "assert";

export default class Case05 extends React.Component<any, any> {
  s
  c

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      pivot: 0,
      position: new Point(200,200),
    }
  }

  componentDidMount() {
    assert(pointsEqual(this.s.getGlobalJointPosition(0), new Point(200,200)))
    assert(pointsEqual(this.s.getGlobalJointPosition(1), new Point(400,200)))
    assert(this.s.getGlobalJointAngle(0) === 180)
    assert(this.s.getGlobalJointAngle(1) === 0)

    assert(pointsEqual(this.c.getGlobalJointPosition(0), new Point(200,200)))
    // assert(pointsEqual(this.c.getGlobalJointPosition(1), new Point(400,200)))
    assert(this.c.getGlobalJointAngle(0) === 180)
    assert(this.c.getGlobalJointAngle(1) === 45)
  }

  componentDidUpdate() {
    switch (this.state.count) {
      case 1:
        assert(pointsEqual(this.s.getGlobalJointPosition(1), new Point(200, 200)))
        assert(pointsEqual(this.s.getGlobalJointPosition(0), new Point(400, 200)))
        assert(this.s.getGlobalJointAngle(1) === 180)
        assert(this.s.getGlobalJointAngle(0) === 0)

        assert(pointsEqual(this.c.getGlobalJointPosition(1), new Point(200, 200)))
        // assert(pointsEqual(this.c.getGlobalJointPosition(1), new Point(400,200)))
        assert(this.c.getGlobalJointAngle(1) === 180)
        assert(this.c.getGlobalJointAngle(0) === 315)
        break
      case 2:
        assert(pointsEqual(this.s.getGlobalJointPosition(0), new Point(300, 200)))
        assert(pointsEqual(this.s.getGlobalJointPosition(1), new Point(500, 200)))
        assert(this.s.getGlobalJointAngle(0) === 180)
        assert(this.s.getGlobalJointAngle(1) === 0)

        assert(pointsEqual(this.c.getGlobalJointPosition(0), new Point(300, 200)))
        // assert(pointsEqual(this.c.getGlobalJointPosition(1), new Point(400,200)))
        assert(this.c.getGlobalJointAngle(0) === 180)
        assert(this.c.getGlobalJointAngle(1) === 45)
        break
    }
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

        <StraightRailPart
          pivotJointIndex={this.state.pivot}
          angle={0}
          position={this.state.position}
          length={200}
          ref={(p) => this.s = p}
        />

        <CurveRailPart
          pivotJointIndex={this.state.pivot}
          position={this.state.position}
          direction={ArcDirection.RIGHT}
          angle={0}
          radius={100}
          centerAngle={45}
          ref={(p) => this.c = p}
        />


        <Tool
          active={true}
          onMouseDown={(e) => {
            switch (this.state.count) {
              case 0:
                this.setState({
                  count: this.state.count + 1,
                  pivot: 1,
                  // position: new Point(300, 200),
                })
                break
              case 1:
                this.setState({
                  count: this.state.count + 1,
                  pivot: 0,
                  position: new Point(300, 200),
                })
                break
              case 2:
                this.setState({
                  count: this.state.count + 1,
                  pivot: 1,
                  position: new Point(300, 200),
                })
                break
            }
          }}
        />
      </View>
    )
  }
}
