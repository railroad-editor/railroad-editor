import * as React from "react";
import {Point} from "paper";
import {Tool, View} from "react-paper-bindings";
import {createGridLines} from "./common";
import DetectablePart from "components/rails/parts/primitives//DetectablePart";
import RectPart from "components/rails/parts/primitives//RectPart";
import {Pivot} from "components/rails/parts/primitives//PartBase";
import PartGroup from "components/rails/parts/primitives//PartGroup";

export default class Case05 extends React.Component<any, any> {

  constructor(props) {
    super(props)
    this.state = {
      count: 0,
      pivot: Pivot.LEFT,
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


    // PivotPartIndexを指定した場合、BoundingBoxではなくそのパーツに対してPivotを指定できる

    return (
      <View width={800}
            height={600}
            matrix={matrix}
            settings={{
              applyMatrix: false
            }}
      >
        {createGridLines(800, 600, 100)}

        <DetectablePart
          mainPart={
            <PartGroup
              pivotPartIndex={0}
              pivot={this.state.pivot}
            >
              <RectPart
                width={50}
                height={50}
              />
            </PartGroup>
          }
          detectionPart={
            <PartGroup
              pivotPartIndex={0}
              pivot={this.state.pivot}
              opacity={0.5}
            >
              <RectPart
                width={100}
                height={100}
              />
            </PartGroup>
          }
          position={new Point(100, 100)}
          // angle={this.angle}
          pivot={this.state.pivot}
          pivotPartIndex={0}
          fillColors={['black', 'orange', 'blue', 'grey']}
          onClick={(e) => console.log('Clicked')}
          detectionEnabled={true}
        />

        {/*<Joint*/}
          {/*position={new Point(400,300)}*/}
          {/*angle={50}*/}
          {/*// ref={(r) => this.r = r}*/}
        {/*/>*/}


        <Tool
          active={true}
          onMouseDown={(e) => {
            switch (this.state.count) {
              case 0:
                // Groupの位置を変更
                this.setState({
                  count: this.state.count + 1,
                  pivot: Pivot.RIGHT,
                })
                break
              case 1:
                this.setState({
                  count: this.state.count + 1,
                  pivot: undefined,
                  pivotPart: undefined
                })
                break
            }
          }}
        />
      </View>
    )
  }
}
