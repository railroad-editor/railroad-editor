import * as React from "react";
import {Item, Point} from "paper";
import {default as PartBase, PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";

export enum ArcDirection {
  RIGHT = 'Right',
  LEFT = 'Left',
}

export interface ArcPartProps extends PartBaseProps {
  width: number
  radius: number
  centerAngle: number
  direction: ArcDirection
}


export default class ArcPart extends PartBase<ArcPartProps, {}> {

  constructor(props: ArcPartProps) {
    super(props)
  }

  getAngle(pivot: Pivot) {
    return super.getAngle(pivot) + this.getInternalPivotAngle(pivot)
  }

  getGlobalAngle(pivot: Pivot) {
    return super.getGlobalAngle(pivot) + this.getInternalPivotAngle(pivot)
  }

  getAngleTo(item: Item, pivot: Pivot) {
    return super.getAngleTo(item, pivot) + this.getInternalPivotAngle(pivot)
  }

  createPathData = (props: ArcPartProps) => {
    const {width, radius, centerAngle, direction} = props
    return createArcPath(width, radius, centerAngle, direction)
  }


  protected getInternalPivotPosition(pivot: Pivot) {
    const {radius, width, centerAngle} = this.props
    switch (pivot) {
      case Pivot.LEFT:
        return new Point(0, 0)
      case Pivot.RIGHT:
        return getEndPoint(width, radius, centerAngle, this.props.direction)
      case Pivot.CENTER:
        return getEndPoint(width, radius, centerAngle/2, this.props.direction)
      default:
        return new Point(0, 0)
    }
  }

  private getInternalPivotAngle(pivot: Pivot) {
    switch (pivot) {
      case Pivot.LEFT:
        return 0
      case Pivot.RIGHT:
        switch (this.props.direction) {
          case ArcDirection.RIGHT:
            return this.props.centerAngle
          case ArcDirection.LEFT:
            return - this.props.centerAngle
          default:
            throw Error(`Invalid direction ${this.props.direction} for ${this.constructor.name}`)
        }
      case Pivot.CENTER:
        switch (this.props.direction) {
          case ArcDirection.RIGHT:
            return this.props.centerAngle / 2
          case ArcDirection.LEFT:
            return - this.props.centerAngle / 2
          default:
            throw Error(`Invalid direction ${this.props.direction} for ${this.constructor.name}`)
        }
      default:
        throw Error(`Invalid pivot ${pivot} for ${this.constructor.name}`)
    }
  }
}


const getEndPoint = (width: number, radius: number, centerAngle: number, direction: ArcDirection) => {
  switch (direction) {
    case ArcDirection.RIGHT:
      return getEndPointRight(width, radius, centerAngle)
    case ArcDirection.LEFT:
      return getEndPointLeft(width, radius, centerAngle)
  }
}

const getEndPointRight = (width: number, radius: number, centerAngle: number) => {
  const outerEndX = (radius + width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const outerEndY = (radius + width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - width / 2;
  const innerEndX = (radius - width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const innerEndY = (radius - width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + width / 2;
  return new Point((outerEndX + innerEndX) / 2, (outerEndY + innerEndY) / 2)
}

const getEndPointLeft = (width: number, radius: number, centerAngle: number) => {
  const outerEndX = (radius + width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const outerEndY = -(radius + width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + width / 2;
  const innerEndX = (radius - width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const innerEndY = -(radius - width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - width / 2;
  return new Point((outerEndX + innerEndX) / 2, (outerEndY + innerEndY) / 2)
}


const createArcPath = (width: number, radius: number, centerAngle: number, direction: ArcDirection) => {
  switch (direction) {
    case ArcDirection.RIGHT:
      return createArcPathRight(width, radius, centerAngle)
    case ArcDirection.LEFT:
      return createArcPathLeft(width, radius, centerAngle)
  }
}

// 右方向に曲がる円弧のパスデータを作成する
const createArcPathRight = (width: number, radius: number, centerAngle: number) => {
  // 曲線の始点・終点の座標を計算
  const outerEndX = (radius + width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const outerEndY = (radius + width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - width / 2;
  const innerEndX = (radius - width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const innerEndY = (radius - width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + width / 2;

  // パスデータの作成
  const pathData = `M 0 0 L 0 ${-width / 2}
  A ${radius + width / 2} ${radius + width / 2}, 0, 0, 1, ${outerEndX} ${outerEndY}
  L ${(outerEndX + innerEndX) / 2} ${(outerEndY + innerEndY) / 2} 
  L ${innerEndX} ${innerEndY} 
  A ${radius - width / 2} ${radius - width / 2} 0, 0, 0, 0 ${ width / 2} Z`
  return pathData
}

// 左方向に曲がる円弧のパスデータを作成する
const createArcPathLeft = (width: number, radius: number, centerAngle: number) => {
  // 曲線の始点・終点の座標を計算
  const outerEndX = (radius + width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const outerEndY = -(radius + width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + width / 2;
  const innerEndX = (radius - width / 2) * Math.sin(centerAngle / 180 * Math.PI);
  const innerEndY = -(radius - width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - width / 2;

  // パスデータの作成
  const pathData = `M 0 0 L 0 ${width / 2}
  A ${radius + width / 2} ${radius + width / 2}, 0, 0, 0, ${outerEndX} ${outerEndY}
  L ${(outerEndX + innerEndX) / 2} ${(outerEndY + innerEndY) / 2} 
  L ${innerEndX} ${innerEndY} 
  A ${radius - width / 2} ${radius - width / 2} 0, 0, 1, 0 ${-width / 2} Z`
  return pathData
}
