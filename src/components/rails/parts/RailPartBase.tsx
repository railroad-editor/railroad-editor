import * as React from "react";
import {Point} from "paper";
import {RailPartMeta} from "components/rails/parts/types";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import getLogger from "logging";
import {normAngle} from "components/rails/utils";
import {FlowDirections} from "components/rails/RailBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";
import {RAIL_PART_WIDTH} from "../../../constants/parts";
import {isArray} from "util";

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
  fillColor?: string
  flowDirections: FlowDirections
  conductionState: number
  showGap?: boolean
}


export default abstract class RailPartBase<P extends RailPartBaseProps, S> extends React.Component<P, S> {
  public static defaultProps: RailPartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    detectionEnabled: true,
    selected: false,
    opacity: 1,
    visible: true,
    fillColor: undefined,
    flowDirections: {},
    conductionState: 0,
    showGap: true,
  }

  partGroup: PartGroup

  protected constructor(props: P) {
    super(props)
  }

  get path() {
    return this.partGroup.path
  }

  componentDidUpdate() {
    logger.trace('updated')
    logger.trace(`[RailPart][${this.props.name}] j0: ${this.getGlobalJointPosition(0)}, ${this.getGlobalJointAngle(0)}`);
    logger.trace(`[RailPart][${this.props.name}] j1: ${this.getGlobalJointPosition(1)}, ${this.getGlobalJointAngle(1)}`);
    this.fixRotationByPivot()
    this.setGapColor()
  }

  componentDidMount() {
    logger.trace('mounted')
    logger.trace(`[RailPart][${this.props.name}] j0: ${this.getGlobalJointPosition(0)}, ${this.getGlobalJointAngle(0)}`);
    logger.trace(`[RailPart][${this.props.name}] j1: ${this.getGlobalJointPosition(1)}, ${this.getGlobalJointAngle(1)}`);
    this.fixRotationByPivot()
    this.setGapColor()
  }

  // 現在レールパーツとギャップは同じグループなので色も同じになってしまう
  // それを防ぐため汚いがここで色をセットする
  // TODO: もっといい方法を考える
  setGapColor = () => {
    this.partGroup.children
      .filter(c => c.props.data.type === 'Gap')
      .forEach(c => {
        c.path.fillColor = 'red'
      })
  }


  fixRotationByPivot = () => {
    const {pivotPartIndex, pivot} = this.getPivot(this.props.pivotJointIndex)
    if (pivotPartIndex != null) {
      const pivotAngle = this.partGroup.children[pivotPartIndex].getAngle(pivot)
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
      this.path.rotation = rotation + this.props.angle
    }
  }

  getPivotPositionToParent(pivotInfo: PivotInfo) {
    let parent = this.partGroup.path.parent
    return this.partGroup.children[pivotInfo.pivotPartIndex].getPositionTo(parent, pivotInfo.pivot)
  }

  getPivotAngleToParent(pivotInfo: PivotInfo) {
    let parent = this.partGroup.path.parent
    let globalRotation = this.partGroup.children[pivotInfo.pivotPartIndex].getAngleTo(parent, pivotInfo.pivot)
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
    let parent = this.partGroup.path.parent
    return this.partGroup.children[pivotPartIndex].getPositionTo(parent, pivot)
  }

  /**
   * グローバル座標系における指定のジョイントの位置を返す。
   * @param {number} jointIndex
   * @returns {paper.Point}
   */
  getGlobalJointPosition(jointIndex: number) {
    // 決まった階層構造を前提としている。どのように実装を矯正すべきか？
    const {pivotPartIndex, pivot} = this.getPivot(jointIndex)
    return this.partGroup.children[pivotPartIndex].getGlobalPosition(pivot)
  }

  /**
   * グローバル座標系における指定のジョイントの角度を返す。
   * @param {number} jointIndex
   * @returns {number}
   */
  getJointAngleToParent(jointIndex: number) {
    const {pivotPartIndex, pivot} = this.getPivot(jointIndex)
    // レールパーツ内部のGroupにおけるPartのPivotにおける角度を取得
    let parent = this.partGroup.path.parent
    let globalRotation = this.partGroup.children[pivotPartIndex].getAngleTo(parent, pivot)
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
    let globalRotation = this.partGroup.children[pivotPartIndex].getGlobalAngle(pivot)
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

  abstract get feederSockets(): PivotInfo[]

  abstract get conductiveParts(): number[]

  get tip() {
    return {pivotPartIndex: 0, pivot: Pivot.CENTER}
  }

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
    const {
      position, angle, pivotJointIndex, selected, fillColor,
      name, data, onLeftClick, onRightClick, visible, opacity, onMouseEnter, onMouseLeave
    } = this.props
    const {pivotPartIndex, pivot} = this.getPivot(pivotJointIndex)

    let parts = this.renderParts().props.children
    if (! isArray(parts)) {
      parts = [parts]
    }
    // Create detection parts
    let detectionParts = parts.map(c => React.cloneElement(c, {
      width: RAIL_PART_WIDTH / 2,
      data: {
        type: 'Detect'
      }
    }))


    return (
      <PartGroup
        position={position}
        angle={angle}
        pivot={pivot}
        pivotPartIndex={pivotPartIndex}
        fillColor={fillColor}
        visible={visible}
        opacity={opacity}
        selected={selected}
        name={name}
        data={data}
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={this.getRef}
      >
        {parts}
        {detectionParts}
      </PartGroup>
    )
  }


  protected getRef = (partGroup) => {
    if (partGroup) this.partGroup = partGroup
  }


  onFrame = (e) => {
    // アニメーションはパーツだけに限定
    this.partGroup.children
      .filter(c => c.props.data.type === 'Part')
      .forEach(c => c.onFrame(e))
  }
}
