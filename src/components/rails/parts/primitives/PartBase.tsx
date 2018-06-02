import * as React from "react";
import {Group, Item, Path, Point} from "paper";
import {Path as PathComponent} from "react-paper-bindings";
import {ANIMATION_FLOW_COLOR_1, ANIMATION_FLOW_COLOR_2} from "constants/parts";
import {RefObject} from "react";

export enum Pivot {
  CENTER = 'Center',
  LEFT = 'Left',
  TOP = 'Top',
  RIGHT = 'Right',
  BOTTOM = 'Bottom',
}

export enum FlowDirection {
  NONE,
  START_TO_END,
  END_TO_START,
  ILLEGAL
}

export interface PartBaseProps extends Partial<PartBaseDefaultProps> {
  position?: Point
  angle?: number
  pivot?: Pivot
  fillColor?: string
  visible?: boolean
  opacity?: number
  selected?: boolean
  name?: string
  data?: any
  onMouseDown?: any
  onMouseDrag?: any
  onMouseUp?: any
  onClick?: any
  onDoubleClick?: any
  onMouseMove?: any
  onMouseEnter?: any
  onMouseLeave?: any
}

export interface PartBaseDefaultProps {
  position?: Point
  angle?: number
  pivot?: Pivot
  fillColor?: string
  visible?: boolean
  opacity?: number
  selected?: boolean
  flowDirection?: FlowDirection
}


export default abstract class PartBase<P extends PartBaseProps, S> extends React.Component<P, S> {
  public static defaultProps: PartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    pivot: Pivot.CENTER,
    fillColor: 'black',
    visible: true,
    opacity: 1,
    selected: false,
    flowDirection: FlowDirection.START_TO_END,
  }


  protected constructor(props: P) {
    super(props)
  }

  protected _path: Path | Group

  // ========== Public APIs ==========

  get path() {
    return this._path
  }

  get position() {
    return this.path.position
  }

  get globalPosition() {
    return this.getGlobalPosition(Pivot.CENTER)
  }

  get angle() {
    return this.getAngle(Pivot.CENTER)
  }

  get globalAngle() {
    return this.getGlobalAngle(Pivot.CENTER)
  }

  /**
   * ローカル座標系における指定のPivotの角度を返す。
   * @param {Pivot} pivot
   */
  getAngle(pivot: Pivot) {
    return this.path.rotation
  }

  /**
   * 指定のアイテムの座標系における指定のPivotの角度を返す。
   * @param {Item} item
   * @param {Pivot} pivot
   * @returns {number}
   */
  getAngleTo(item: Item, pivot: Pivot) {
    // (this.path as any)._project._updateVersion += 1
    return this.path.getMatrixTo(item).decompose().rotation
  }

  /**
   * グローバル座標系における指定のPivotの角度を返す。
   * @param {Pivot} pivot
   */
  getGlobalAngle(pivot: Pivot) {
    // (this.path as any)._project._updateVersion += 1
    return (this.path as any).getGlobalMatrix().decompose().rotation
  }

  /**
   * ローカル座標系における指定のPivotの位置を返す。
   * @param {Pivot} pivot
   */
  getPosition(pivot: Pivot) {
    return this.path.localToParent(this.getInternalPivotPosition(pivot))
  }

  /**
   * 指定のアイテムの座標系における指定のPivotの位置を返す。
   * @param {Item} item
   * @param {Pivot} pivot
   */
  getPositionTo(item: Item, pivot: Pivot) {
    // const p = this.path.localToOther(path, this.getInternalPivotPosition(pivot))
    // console.log(path.position)
    // console.log(p)
    // (this.path as any)._project._updateVersion += 1
    return this.path.localToOther(item, this.getInternalPivotPosition(pivot))
  }

  /**
   * グローバル座標系における指定のPivotの位置を返す。
   * @param {Pivot} pivot
   */
  getGlobalPosition(pivot: Pivot) {
    // This is a workaround of
    (this.path as any)._project._updateVersion += 1
    return this.path.localToGlobal(this.getInternalPivotPosition(pivot))
  }

  /**
   * Path内部における指定のPivotの位置を返す。
   * 派生クラスで要実装。
   * @param {Pivot} pivot
   */
  protected abstract getInternalPivotPosition(pivot: Pivot)

  /**
   * PathDataを返す。
   * 派生クラスで要実装。
   */
  protected abstract createPathData: (props: P) => string

  /**
   * 電流アニメーションをする
   * @param event
   */
  onFrame = (event) => {
    let ratio = event.count % 60 / 60;
    let currentOrigin;
    let currentDestination

    switch (this.props.flowDirection) {
      case FlowDirection.NONE:
        // アニメーションしない
        this.path.fillColor = "black";
        return;
      case FlowDirection.START_TO_END:
        currentOrigin = this.getPosition(Pivot.LEFT).multiply(2 - ratio).add(this.getPosition(Pivot.RIGHT).multiply(ratio - 1))
        currentDestination = currentOrigin.add(this.getPosition(Pivot.RIGHT).subtract(this.getPosition(Pivot.LEFT)).multiply(2))
        // log.debug("S to E : ", currentOrigin, "=>", currentDestination);
        break;
      case FlowDirection.END_TO_START:
        currentOrigin = this.getPosition(Pivot.LEFT).multiply(ratio + 1).add(this.getPosition(Pivot.RIGHT).multiply(-ratio))
        currentDestination = currentOrigin.add(this.getPosition(Pivot.RIGHT).subtract(this.getPosition(Pivot.LEFT)).multiply(2))
        // log.debug("E to S : ", currentOrigin, "=>", currentDestination);
        break;
      case FlowDirection.ILLEGAL:
        this.path.fillColor = "red";
        return;
    }

    this.path.fillColor = {
      gradient: {
        stops: [ANIMATION_FLOW_COLOR_1, ANIMATION_FLOW_COLOR_2, ANIMATION_FLOW_COLOR_1, ANIMATION_FLOW_COLOR_2, ANIMATION_FLOW_COLOR_1]
      },
      origin: currentDestination,
      destination: currentOrigin,
    } as any
  }


  render() {
    const { position, angle, pivot, fillColor, visible, opacity, selected, name, data,
      onMouseDown, onMouseDrag, onMouseUp, onClick, onDoubleClick, onMouseMove, onMouseEnter, onMouseLeave
    } = this.props

    const pathData = this.createPathData(this.props)
    const pivotPosition = this.getInternalPivotPosition(pivot)

    return <PathComponent
      pathData={pathData}
      pivot={pivotPosition}     // pivot parameter MUST proceed to position
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
      ref={this.getRef}
    />
  }

  protected getRef = (ref) => {
    if (ref) this._path = ref
  }

}

