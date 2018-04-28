import * as React from "react";
import RectPart from "components/rails/parts/primitives/RectPart";
import {Point} from "paper";
import {View} from "react-paper-bindings";
import {createGridLines} from "./common";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import ArcPart, {ArcDirection} from "components/rails/parts/primitives/ArcPart";

export default class Case02 extends React.Component<any, any> {

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

    let paths = [
      <RectPart
        position={new Point(200, 200)}
        pivot={Pivot.LEFT}
        angle={30}
        width={100}
        height={100}
      />,
      <RectPart
        position={new Point(200, 200)}
        pivot={Pivot.RIGHT}
        angle={30}
        width={100}
        height={100}
      />
    ]

    // PartGroupのposition, angle, pivot, pivotPartIndex のテスト

    return (
      <View width={800}
            height={800}
            matrix={matrix}
            settings={{
              applyMatrix: false
            }}
      >
        {createGridLines(800, 600, 100)}

        /* pivotPartIndexを指定しない場合、BoundingBox全体に対するpivot指定となる */
        {/*<PartGroup*/}
          {/*pivot={Pivot.LEFT}*/}
          {/*position={new Point(100,200)}*/}
          {/*angle={30}*/}
          {/*fillColor={'red'}*/}
        {/*>*/}
          {/*{paths}*/}
        {/*</PartGroup>*/}
        {/*<PartGroup*/}
          {/*position={new Point(400,200)}*/}
          {/*angle={30}*/}
          {/*fillColor={'red'}*/}
        {/*>*/}
          {/*{paths}*/}
        {/*</PartGroup>*/}
        {/*<PartGroup*/}
          {/*pivot={Pivot.RIGHT}*/}
          {/*position={new Point(700,200)}*/}
          {/*angle={30}*/}
          {/*fillColor={'red'}*/}
        {/*>*/}
          {/*{paths}*/}
        {/*</PartGroup>*/}

        /* pivotPartIndexを指定した場合、指定のIndexのパーツに対するpivot指定となる */
        <PartGroup
          pivotPartIndex={0}
          pivot={Pivot.RIGHT}
          position={new Point(200,500)}
          angle={30}
          fillColor={'red'}
        >
          {paths}
        </PartGroup>

        <PartGroup
          pivotPartIndex={1}
          pivot={Pivot.LEFT}
          position={new Point(400,500)}
          angle={30}
          fillColor={'red'}
        >
          {paths}
        </PartGroup>


        <PartGroup
          position={new Point(200,100)}
          pivotPartIndex={0}
          pivot={Pivot.RIGHT}
          angle={45}
        >
          <ArcPart
            position={new Point(200, 400)}
            pivot={Pivot.LEFT}
            angle={0}
            direction={ArcDirection.LEFT}
            width={10}
            radius={50}
            centerAngle={45}
            fillColor='red'
          />
          <ArcPart
            position={new Point(200, 400)}
            pivot={Pivot.LEFT}
            angle={0}
            direction={ArcDirection.RIGHT}
            width={10}
            radius={50}
            centerAngle={45}
            fillColor='red'
          />
        </PartGroup>

      </View>
    )
  }
}
