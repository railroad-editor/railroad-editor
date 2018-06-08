import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import DetectablePart from "./primitives/DetectablePart";
import {RAIL_PART_FILL_COLORS} from "constants/parts";
import {RailPartMeta} from "components/rails/parts/types";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import getLogger from "logging";
import {ReactElement} from "react";
import {normAngle} from "components/rails/utils";
import {FlowDirections} from "components/rails/RailBase";

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
  onMouseEnter?: (e: MouseEvent) => boolean
  onMouseLeave?: (e: MouseEvent) => boolean

  pivotJointIndex?: number
}

export interface RailPartBaseDefaultProps {
  position?: Point
  angle?: number
  detectionEnabled?: boolean
  selected?: boolean
  opacity?: number
  visible?: boolean
  fillColors?: string[]
  flowDirections: FlowDirections
  switchState: number
}


export default abstract class RailPartBase<P extends RailPartBaseProps, S> extends React.Component<P, S> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: true,
    selected: false,
    opacity: 1,
    visible: true,
    fillColors: RAIL_PART_FILL_COLORS,
    flowDirections: {},
    switchState: 0
  }

  detectablePart: DetectablePart

  protected constructor(props: P) {
    super(props)
  }

  get path() { return this.detectablePart.mainPart.path }

  componentDidUpdate() {
    logger.trace('updated')
    logger.trace(`[RailPart][${this.props.name}] j0: ${this.getGlobalJointPosition(0)}, ${this.getGlobalJointAngle(0)}`);
    logger.trace(`[RailPart][${this.props.name}] j1: ${this.getGlobalJointPosition(1)}, ${this.getGlobalJointAngle(1)}`);
    this.fixRotationByPivot()
  }

  componentDidMount() {
    logger.trace('mounted')
    logger.trace(`[RailPart][${this.props.name}] j0: ${this.getGlobalJointPosition(0)}, ${this.getGlobalJointAngle(0)}`);
    logger.trace(`[RailPart][${this.props.name}] j1: ${this.getGlobalJointPosition(1)}, ${this.getGlobalJointAngle(1)}`);
    this.fixRotationByPivot()
  }


  fixRotationByPivot = () => {
    const {pivotPartIndex, pivot} = this.getPivot(this.props.pivotJointIndex)
    if (pivotPartIndex != null) {
      const pivotAngle = this.detectablePart.mainPart.children[pivotPartIndex].getAngle(pivot)
      let rotation
      switch (pivot) {
        case Pivot.LEFT:
          rotation = normAngle(360 - pivotAngle)
          break
        case Pivot.RIGHT:
          rotation = normAngle(360 - (pivotAngle + 180))
          break
        default:
          throw Error(`Invalid pivot ${pivot} for ${this.constructor.name}`)
      }
      this.path.rotation = rotation
    }
  }

  getPivotPositionToParent(pivotInfo: PivotInfo) {
    let parent = this.detectablePart.partGroup.path.parent
    return this.detectablePart.mainPart.children[pivotInfo.pivotPartIndex].getPositionTo(parent, pivotInfo.pivot)
  }

  getPivotAngleToParent(pivotInfo: PivotInfo) {
    let parent = this.detectablePart.partGroup.path.parent
    let globalRotation = this.detectablePart.mainPart.children[pivotInfo.pivotPartIndex].getAngleTo(parent, pivotInfo.pivot)
    if (pivotInfo.pivot === Pivot.LEFT) {
      return (globalRotation + 180) % 360
    } else {
      return globalRotation
    }
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
   * 各ジョイントのPivot情報を返す。
   * 派生クラスに要実装。
   * @returns {PivotInfo[]}
   */
  abstract get joints(): PivotInfo[]

  abstract get glues(): PivotInfo[][]

  abstract get gaps(): PivotInfo[]

  abstract get conductiveParts(): number[]

  abstract get feederSockets(): PivotInfo[]

  getPivot(jointIndex: number) {
    if (jointIndex == null) {
      return {pivotPartIndex: undefined, pivot: Pivot.CENTER}
    }
    return this.joints[jointIndex]
  }

  /**
   * パーツのJSXElementを返す。
   */
  abstract renderParts: () => React.ReactElement<any>


  render() {
    const { position, pivotJointIndex, detectionEnabled, selected, fillColors,
      name, data, onLeftClick, onRightClick, visible, opacity, onMouseEnter, onMouseLeave
    } = this.props
    const pivot = _.isNil(pivotJointIndex) ? undefined: this.getPivot(pivotJointIndex).pivot
    const part = this.renderParts()

    return (
      <DetectablePart
        mainPart={part}
        detectionPart={<></>}
        position={position}
        angle={this.props.angle}
        pivot={pivot}
        pivotPartIndex={0}    // 常にGroupなのでこれで良い
        fillColors={fillColors}
        visible={visible}
        opacity={opacity}
        detectionEnabled={true}
        preventBringToFront={true}
        name={name}
        data={data}
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        selected={selected}
        ref={this.getRef}
      />
    )
  }


  protected getRef = (detectablePart) => {
    if (detectablePart) this.detectablePart = detectablePart
  }


  onFrame = (e) => {
    this.detectablePart.mainPart._children.forEach(c => c.onFrame(e))
  }
}
