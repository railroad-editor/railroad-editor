import * as React from "react";
import RectPart from "components/rails/parts/primitives//RectPart";
import {Point} from "paper";
import {Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import PartGroup from "components/rails/parts/primitives//PartGroup";
import CirclePart from "components/rails/parts/primitives//CirclePart";
import * as assert from "assert";
import {pointsEqual} from "components/rails/utils";

export default class Case04 extends React.Component<any, any> {

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      pivot: 0,
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


        <PartGroup
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
                  g1_position: new Point(300, 300),
                })
                break
              case 1:
                // 子の位置とGroupの位置を変更
                // g1_positionを変更すると、移動後の子の位置で再計算された中心をPivotとして描画される
                // g1_positionを変更しない場合、Groupの位置は変わらない。
                this.setState({
                  count: this.state.count + 1,
                  g1_position: new Point(300, 400),
                  c2_position: new Point(300, 200),
                  c3_position: new Point(550, 200)
                })
                break
            }
          }}
        />

      </View>
    )
  }
}
