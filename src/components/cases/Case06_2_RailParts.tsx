import * as React from "react";
import {Point} from "paper";
import {View} from "react-paper-bindings";
import {createGridLines} from "./common";
import {ArcDirection} from "components/rails/parts/primitives//ArcPart";
import DoubleCurveRailPart from "components/rails/parts/DoubleCurveRailPart";

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

        {/*<DoubleStraightRailPart*/}
        {/*pivotJointIndex={0}*/}
        {/*angle={30}*/}
        {/*position={new Point(100,200)}*/}
        {/*length={200}*/}
        {/*/>*/}

        {/*<DoubleStraightRailPart*/}
        {/*pivotJointIndex={1}*/}
        {/*angle={30}*/}
        {/*position={new Point(200,200)}*/}
        {/*length={200}*/}
        {/*/>*/}

        {/*<DoubleStraightRailPart*/}
        {/*pivotJointIndex={2}*/}
        {/*angle={30}*/}
        {/*position={new Point(300,200)}*/}
        {/*length={200}*/}
        {/*/>*/}

        {/*<DoubleStraightRailPart*/}
        {/*pivotJointIndex={3}*/}
        {/*angle={30}*/}
        {/*position={new Point(400,200)}*/}
        {/*length={200}*/}
        {/*/>*/}

        <DoubleCurveRailPart
          pivotJointIndex={1}
          innerRadius={200}
          outerRadius={240}
          centerAngle={45}
          direction={ArcDirection.LEFT}
          position={new Point(400, 200)}
        />

        {/*<DoubleCrossTurnoutRailPart*/}
        {/*pivotJointIndex={0}*/}
        {/*angle={30}*/}
        {/*position={new Point(100,400)}*/}
        {/*length={200}*/}
        {/*onFixed={() => console.log("FIXED!")}*/}
        {/*/>*/}

        {/*<DoubleCrossTurnoutRailPart*/}
        {/*pivotJointIndex={1}*/}
        {/*angle={30}*/}
        {/*position={new Point(200,400)}*/}
        {/*length={200}*/}
        {/*onFixed={() => console.log("FIXED!")}*/}
        {/*/>*/}

      </View>
    )
  }
}
