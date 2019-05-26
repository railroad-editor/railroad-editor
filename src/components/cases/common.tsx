import * as React from "react";
import {Line} from "react-paper-bindings";
import {Point} from "paper";
import * as _ from "lodash";

export const createGridLines = (width, height, gridSize) => {
  let ret = []
  // 縦のグリッドを生成
  const verticalLines = _.range(width / gridSize).map(i => {
    return (
      <Line
        from={new Point(gridSize * i, 0)}
        to={new Point(gridSize * i, height)}
        strokeColor={'red'}
      />)
  })
  // 横のグリッドを生成
  const horizontalLines = _.range(height / gridSize).map(i => {
    return (
      <Line
        from={new Point(0, gridSize * i)}
        to={new Point(width, gridSize * i)}
        strokeColor={'red'}
      />)
  })

  ret.push(verticalLines)
  ret.push(horizontalLines)
  return ret
}

