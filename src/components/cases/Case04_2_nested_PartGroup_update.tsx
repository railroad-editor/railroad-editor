import * as React from "react";
import RectPart from "components/rails/parts/primitives//RectPart";
import {Point} from "paper";
import {Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import {Pivot} from "components/rails/parts/primitives//PartBase";
import PartGroup from "components/rails/parts/primitives//PartGroup";
import CirclePart from "components/rails/parts/primitives//CirclePart";
import {pointsEqual} from "components/rails/utils";
import * as assert from "assert";

export default class Case04 extends React.Component<any, any> {

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      pivot: Pivot.LEFT,
      g1_position: new Point(200, 200),
      g2_position: new Point(250, 200),
      c1_position: new Point(200, 100),
      c2_position: new Point(300, 100),
      c3_position: new Point(350, 200),
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

    /*
      Pivot指定あり＋PivotPart指定なしのパターン
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
          Pivot指定あり＋PivotPart指定なしのパターン
          常にBoundingBoxに対するPivot指定となる
         */

        <PartGroup
          pivot={this.state.pivot}
          position={this.state.g1_position}
          name={'G1'}
          ref={(g) => {
            // 位置が確定していることを確認
            if (g) {
              console.log(`${g.getPosition(this.state.pivot)}, ${this.state.g1_position})`);
              assert(pointsEqual(g.getPosition(this.state.pivot), this.state.g1_position))
            }
          }}
        >
          <CirclePart
            position={new Point(150, 200)}
            radius={50}
            name={'c1'}
            opacity={0.5}
            fillColor={'blue'}
          />
          <PartGroup
            position={this.state.g2_position}
          >
            <RectPart
              position={this.state.c1_position}
              width={100}
              height={100}
              opacity={0.5}
              fillColor={'red'}
            />
            <RectPart
              position={this.state.c2_position}
              width={100}
              height={100}
              opacity={0.5}
              fillColor={'green'}
            />
          </PartGroup>
          <CirclePart
            position={this.state.c3_position}
            radius={50}
            name={'c1'}
            opacity={0.5}
            fillColor={'blue'}
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
                  g1_position: new Point(500, 300),
                  pivot: Pivot.RIGHT
                })
                break
              case 1:
                // 子の位置とGroupの位置を変更
                // ここでGroup内のパーツの位置を変更するのでPivotも変化する
                this.setState({
                  count: this.state.count + 1,
                  // g1_position: new Point(500,300),
                  c2_position: new Point(300, 200),
                  c3_position: new Point(450, 200)
                })
                break
              case 2:
                // 子の位置とGroupの位置を変更
                // ここでGroup内のパーツの位置を変更するのでPivotも変化する
                this.setState({
                  count: this.state.count + 1,
                  g1_position: new Point(500, 400),
                })
                break
            }
          }}
        />

      </View>
    )
  }
}
