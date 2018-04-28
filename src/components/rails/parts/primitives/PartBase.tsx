import * as React from "react";
import {Group, Item, Path, Point} from "paper";

export enum Pivot {
  CENTER = 'Center',
  LEFT = 'Left',
  TOP = 'Top',
  RIGHT = 'Right',
  BOTTOM = 'Bottom',
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
  onFrame?: any
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
  }

  constructor(props: P) {
    super(props)

    this.getInstance = this.getInstance.bind(this)
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

  componentDidMount() {
  }

  componentWillReceiveProps(nextProps: PartBaseProps) {
  }

  /**
   * Path内部における指定のPivotの位置を返す。
   * 派生クラスで要実装。
   * @param {Pivot} pivot
   */
  protected abstract getInternalPivotPosition(pivot: Pivot)

  protected getInstance(path) {
    if (path) this._path = path
  }

  // shouldComponentUpdate(nextProps) {
  //   if (this.props.position.x === nextProps.position.x && this.props.position.y === nextProps.position.y) {
  //     return false
  //   }
  //   if (this.props.angle === nextProps.angle) {
  //     return false
  //   }
  //   return true
  // }

  // moveRelatively(difference: Point) {
  //   this._path.position = this._path.position.add(difference);
  // }
  //
  // move(position: Point, pivot: Point = this.position): void {
  //   let difference = position.subtract(pivot);
  //   this.moveRelatively(difference);
  // }
  //
  // rotateRelatively(difference: number, pivot: Point = this.position) {
  //   this._angle += difference
  //   this.path.rotate(difference, pivot);
  // }
  //
  // rotate(angle: number, pivot: Point = this.position) {
  //   let relAngle = angle - this.angle
  //   this.rotateRelatively(relAngle, pivot);
  // }
}

