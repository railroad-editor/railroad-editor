import * as React from "react";
import {Item, Point} from "paper";
import {Path as PathComponent} from "react-paper-bindings";
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

  render() {
    const {
      width, radius, centerAngle, direction, pivot,
      position, angle, fillColor, visible, opacity, selected, name, data,
      onMouseDown, onMouseDrag, onMouseUp, onClick, onDoubleClick, onMouseMove, onMouseEnter, onMouseLeave
    } = this.props

    const pivotPosition = this.getInternalPivotPosition(pivot)

    return <PathComponent
      pathData={createArcPath(width, radius, centerAngle, direction)}
      pivot={pivotPosition}
      position={position}
      rotation={angle}
      fillColor={fillColor}
      visible={visible}
      opacity={opacity}
      selected={selected}
      name={name}
      data={data}
      onMouseDown={onMouseDown}
      onMouseDrag={onMouseDrag}
      onMouseUp={onMouseUp}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={this.getInstance}
    />
  }

  protected getInternalPivotPosition(pivot: Pivot) {
    switch (this.props.direction) {
      case ArcDirection.RIGHT:
        return this.getInternalPivotPositionRight(pivot)
      case ArcDirection.LEFT:
        return this.getInternalPivotPositionLeft(pivot)
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
            return -this.props.centerAngle
          default:
            throw Error(`Invalid direction ${this.props.direction} for ${this.constructor.name}`)
        }
      default:
        throw Error(`Invalid pivot ${pivot} for ${this.constructor.name}`)
    }
  }

  private getInternalPivotPositionRight(pivot: Pivot) {
    const {radius, width, centerAngle} = this.props
    // 曲線の始点・終点の座標を計算
    const outerEndX = (radius + width / 2) * Math.sin(centerAngle / 180 * Math.PI);
    const outerEndY = (radius + width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - width / 2;
    const innerEndX = (radius - width / 2) * Math.sin(centerAngle / 180 * Math.PI);
    const innerEndY = (radius - width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + width / 2;

    switch (pivot) {
      case Pivot.RIGHT:
        return new Point((outerEndX + innerEndX) / 2, (outerEndY + innerEndY) / 2)
      case Pivot.LEFT:
      // same as default
      default:
        return new Point(0, 0)
    }
  }

  private getInternalPivotPositionLeft(pivot: Pivot) {
    const {radius, width, centerAngle, direction} = this.props
    // 曲線の始点・終点の座標を計算
    const outerEndX = (radius + width / 2) * Math.sin(centerAngle / 180 * Math.PI);
    const outerEndY = -(radius + width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) + width / 2;
    const innerEndX = (radius - width / 2) * Math.sin(centerAngle / 180 * Math.PI);
    const innerEndY = -(radius - width / 2) * (1 - Math.cos(centerAngle / 180 * Math.PI)) - width / 2;

    switch (pivot) {
      case Pivot.RIGHT:
        return new Point((outerEndX + innerEndX) / 2, (outerEndY + innerEndY) / 2)
      case Pivot.LEFT:
      // same as default
      default:
        return new Point(0, 0)
    }
  }
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
