import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import DetectablePart from "./primitives/DetectablePart";
import {RAIL_PART_FILL_COLORS} from "constants/parts";
import {RailPartMeta} from "components/rails/parts/types";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import getLogger from "logging";

const logger = getLogger(__filename)

export interface PivotInfo {
  pivot: Pivot
  pivotPartIndex: number
}

export interface RailPartBaseProps extends Partial<RailPartBaseDefaultProps> {
  name?: string
  data?: RailPartMeta
  onLeftClick?: (e: MouseEvent) => boolean
  onRightClick?: (e: MouseEvent) => boolean
}

export interface RailPartBaseDefaultProps {
  position?: Point
  angle?: number
  pivotJointIndex?: number
  detectionEnabled?: boolean
  selected?: boolean
  opacity?: number
  visible?: boolean
  fillColors?: string[]
}


export default abstract class RailPartBase<P extends RailPartBaseProps, S> extends React.Component<P, S> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    pivotJointIndex: 0,
    detectionEnabled: false,
    selected: false,
    opacity: 1,
    visible: true,
    fillColors: RAIL_PART_FILL_COLORS
  }

  public static RAIL_SPACE = 38

  detectablePart: DetectablePart

  constructor(props: P) {
    super(props)
    this.getInstance = this.getInstance.bind(this)
  }

  get path() { return this.detectablePart.mainPart.path }

  componentDidUpdate() {
    logger.trace('updated')
    logger.trace(`[RailPart][${this.props.name}] j0: ${this.getGlobalJointPosition(0)}, ${this.getGlobalJointAngle(0)}`);
    logger.trace(`[RailPart][${this.props.name}] j1: ${this.getGlobalJointPosition(1)}, ${this.getGlobalJointAngle(1)}`);
  }

  componentDidMount() {
    logger.trace('mounted')
    logger.trace(`[RailPart][${this.props.name}] j0: ${this.getGlobalJointPosition(0)}, ${this.getGlobalJointAngle(0)}`);
    logger.trace(`[RailPart][${this.props.name}] j1: ${this.getGlobalJointPosition(1)}, ${this.getGlobalJointAngle(1)}`);
  }

  /**
   * このパーツの親の座標系における指定のジョイントの位置を返す。
   * @param {number} jointIndex
   * @returns {paper.Point}
   */
  getJointPositionToParent(jointIndex: number) {
    // 決まった階層構造を前提としている。どのように実装を矯正すべきか？
    const {pivotPartIndex, pivot} = this.getPivot(jointIndex)
    let parent = this.detectablePart.partGroup.path.parent
    return this.detectablePart.mainPart.children[pivotPartIndex].getPositionTo(parent, pivot)
  }

  /**
   * グローバル座標系における指定のジョイントの位置を返す。
   * @param {number} jointIndex
   * @returns {paper.Point}
   */
  getGlobalJointPosition(jointIndex: number) {
    // 決まった階層構造を前提としている。どのように実装を矯正すべきか？
    const {pivotPartIndex, pivot} = this.getPivot(jointIndex)
    return this.detectablePart.mainPart.children[pivotPartIndex].getGlobalPosition(pivot)
  }

  /**
   * グローバル座標系における指定のジョイントの角度を返す。
   * @param {number} jointIndex
   * @returns {number}
   */
  getJointAngleToParent(jointIndex: number) {
    const {pivotPartIndex, pivot} = this.getPivot(jointIndex)
    // レールパーツ内部のGroupにおけるPartのPivotにおける角度を取得
    let parent = this.detectablePart.partGroup.path.parent
    let globalRotation = this.detectablePart.mainPart.children[pivotPartIndex].getAngleTo(parent, pivot)
    if (pivot === Pivot.LEFT) {
      return (globalRotation + 180) % 360
    } else {
      return globalRotation
    }
  }

  /**
   * グローバル座標系における指定のジョイントの角度を返す。
   * @param {number} jointIndex
   * @returns {number}
   */
  getGlobalJointAngle(jointIndex: number) {
    const {pivotPartIndex, pivot} = this.getPivot(jointIndex)
    // レールパーツ内部のGroupにおけるPartのPivotにおける角度を取得
    let globalRotation = this.detectablePart.mainPart.children[pivotPartIndex].getGlobalAngle(pivot)
    if (pivot === Pivot.LEFT) {
      return (globalRotation + 180) % 360
    } else {
      return globalRotation
    }
  }

  /**
   * 指定のジョイントのPivot情報を返す。
   * 派生クラスに要実装。
   * @param {number} jointIndex
   * @returns {PivotInfo}
   */
  abstract getPivot(jointIndex: number): PivotInfo

  /**
   * 指定のジョイントがPivotとして指定された時のRailPartの角度を返す。
   * 派生クラスに要実装。
   * TODO: componentDidMountで角度を決定するようにすれば無くせるかも
   * @param {number} jointIndex
   * @returns {number}
   */
  abstract getAngle(jointIndex: number): number


  protected createComponent(mainPart, detectionPart) {
    const { position, pivotJointIndex, detectionEnabled, selected, fillColors,
      name, data, onLeftClick, onRightClick, visible, opacity
    } = this.props

    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    return (
      <DetectablePart
        mainPart={mainPart}
        detectionPart={detectionPart}
        position={position}
        angle={this.getAngle(pivotJointIndex)}
        pivot={pivot}
        pivotPartIndex={0}
        fillColors={fillColors}
        visible={visible}
        opacity={opacity}
        detectionEnabled={detectionEnabled}
        name={name}
        data={data}
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        selected={selected}
        ref={this.getInstance}
      />
    )
  }

  protected getInstance(detectablePart) {
    if (detectablePart) this.detectablePart = detectablePart
  }

}
