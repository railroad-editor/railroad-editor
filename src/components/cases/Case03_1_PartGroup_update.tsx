import * as React from "react";
import RectPart from "components/rails/parts/primitives//RectPart";
import {Point} from "paper";
import {Rectangle, Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import PartGroup from "components/rails/parts/primitives//PartGroup";
import * as assert from "assert";
import {pointsEqual} from "components/rails/utils";


export default class Case03 extends React.Component<any, any> {
  g

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      position: new Point(200,200),
      child_position_1: new Point(200,100),
      child_position_2: new Point(300,100)
    }
    this.g = null
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

    console.log(this.state)

    /*
      Pivot指定なし＋PivotPart指定なしのパターン
     */

    return (
      <View width={800}
            height={600}
            matrix={matrix}
            settings={{
              applyMatrix: false
            }}
      >
        {createGridLines(800, 600, 100)}

        /*
          Pivot指定なし＋PivotPart指定なしのパターン
         */

        <PartGroup
          position={this.state.position}
          ref={(g) => {
            // 位置が確定していることを確認
            if (g) assert(pointsEqual(g.position, this.state.position))
          }}
        >
          <RectPart
            position={this.state.child_position_1}
            width={100}
            height={100}
            opacity={0.5}
            fillColor={'red'}
          />
          <RectPart
            position={this.state.child_position_2}
            width={100}
            height={100}
            opacity={0.5}
            fillColor={'green'}
          />
        </PartGroup>

        <Tool
          active={true}
          onMouseDown={(e) => {
            switch (this.state.count) {
              case 0:
                // Groupの位置を変更
                this.setState({
                  count: this.state.count + 1,
                  position: new Point(300, 200),
                })
                break
              case 1:
                // 子とGroupの位置を変更
                // GroupのBoundingBoxが変化したので、Pivotとなる中心点も変わる。
                this.setState({
                  count: this.state.count + 1,
                  position: new Point(300,300),
                  child_position_2: new Point(500,100)
                })
                break
            }
          }}
        />
      </View>
    )
  }
}
