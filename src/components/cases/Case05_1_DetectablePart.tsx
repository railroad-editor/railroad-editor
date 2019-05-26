import * as React from "react";
import {Point} from "paper";
import {View} from "react-paper-bindings";
import {createGridLines} from "./common";
import DetectablePart from "components/rails/parts/primitives//DetectablePart";
import RectPart from "components/rails/parts/primitives//RectPart";
import {Pivot} from "components/rails/parts/primitives//PartBase";
import Joint from "components/rails/parts/Joint";

export default class Case05 extends React.Component<any, any> {

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
            <RectPart
              position={new Point(0, 0)}
              width={50}
              height={50}
            />
          }
          detectionPart={
            <RectPart
              position={new Point(0, 0)}
              width={70}
              height={70}
              opacity={0.5}
            />
          }
          position={new Point(100, 100)}
          // angle={this.angle}
          pivot={Pivot.LEFT}
          pivotPartIndex={0}
          fillColors={['black', 'orange', 'blue', 'grey']}
          // onClick={(e) => console.log('Clicked')}
          detectionEnabled={true}
        />

        <Joint
          position={new Point(400, 300)}
          angle={50}
          // ref={(r) => this.r = r}
        />


      </View>
    )
  }
}
