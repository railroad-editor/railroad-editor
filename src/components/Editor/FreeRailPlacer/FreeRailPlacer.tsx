import * as React from "react";
import {Point} from "paper";
import {Rectangle, Tool} from "react-paper-bindings";
import RectPart from "../../rails/parts/primitives/RectPart";
import {getClosest} from "constants/utils";
import getLogger from "logging";
import {default as withBuilder, WithBuilderPublicProps} from "components/hoc/withBuilder";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import CirclePart from "components/rails/parts/primitives/CirclePart";
import {RAIL_PUTTER_MARKER_RADIUS, Tools} from "constants/tools";
import {JOINT_DETECTION_OPACITY_RATE, JOINT_FILL_COLORS} from "constants/parts";
import {CommonStore} from "store/commonStore";
import {EditorMode} from "store/uiStore";

const LOGGER = getLogger(__filename)


enum Phase {
  SET_POSITION,
  SET_POSITION_GRID,
  SET_ANGLE
}

export interface FreeRailPlacerProps {
  mousePosition: Point
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore
}

export interface FreeRailPlacerState {
  fixedPosition: Point
  phase: Phase

}

type FreeRailPlacerEnhancedProps = FreeRailPlacerProps & WithBuilderPublicProps


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT)
@observer
export class FreeRailPlacer extends React.Component<FreeRailPlacerEnhancedProps, FreeRailPlacerState> {

  constructor(props: FreeRailPlacerEnhancedProps) {
    super(props)
    this.state = {
      fixedPosition: null,
      phase: Phase.SET_POSITION
    }

    this.onClick = this.onClick.bind(this)
  }

  onClick = (e: MouseEvent|any) => {
    switch (e.event.button) {
      case 0:
        this.mouseLeftDown(e)
        break
      case 2:
        this.mouseRightDown(e)
        break
    }
  }

  mouseLeftDown = (e: MouseEvent) => {
    if (this.state.phase === Phase.SET_ANGLE) {
      // 位置が決定済みならば角度を決定する
      this.onSetAngle()
    } else {
      // そうでなければ位置を決定する
      this.onSetPosition()
    }
  }

  mouseRightDown = (e: MouseEvent) => {
    // レールの向きを変更する
    if (this.state.phase === Phase.SET_ANGLE) {
      if (this.props.builder.temporaryRailGroup) {
        // レールグループの場合
        this.props.builder.updateTemporaryRailGroup({
          pivotJointInfo: this.props.builder.nextPivotJointInfo
        })
      } else if (this.props.builder.temporaryRails) {
        // 単体レールの場合
        this.props.builder.updateTemporaryRail({
          pivotJointIndex: this.props.builder.nextPivotJointIndex
        })
      }
    }
  }

  getMarkerPosition = () => {
    switch (this.state.phase) {
      case Phase.SET_POSITION:
        return this.props.mousePosition
      case Phase.SET_POSITION_GRID:
        return this.getNearestGridPosition(this.props.mousePosition)
      default:
        return this.props.mousePosition
    }
  }

  onSetPosition = () => {
    this.setState({
      fixedPosition: this.getMarkerPosition(),
      phase: Phase.SET_ANGLE
    })
  }

  onSetAngle = () => {
    this.addRail()
  }

  onMouseMove = (e: MouseEvent|any) => {
    // Ctrlキーを押している間はグリッド設置モードに移行する
    if (! e.modifiers.shift && this.state.phase === Phase.SET_POSITION_GRID) {
      this.setState({phase: Phase.SET_POSITION})
    }
    if (e.modifiers.shift && this.state.phase === Phase.SET_POSITION) {
      this.setState({phase: Phase.SET_POSITION_GRID})
    }
    if (this.state.phase === Phase.SET_ANGLE) {
      this.showTemporaryRailOrRailGroup()
    }
  }


  render() {
    let position
    // 位置が定まっていたらもう動かさない
    if (this.state.phase === Phase.SET_ANGLE) {
      position = this.state.fixedPosition
    } else {
      position = this.getMarkerPosition()
    }

    // パンツール使用中は何もしない
    if (this.props.builder.activeTool === Tools.PAN) {
      return null
    }

    return (
      <>
        {
          this.props.common.editorMode === EditorMode.BUILDER &&
          this.props.builder.placingMode === PlacingMode.FREE &&
          <>
            <CirclePart
              radius={RAIL_PUTTER_MARKER_RADIUS}
              position={position}
              fillColor={JOINT_FILL_COLORS[0]}
              opacity={JOINT_DETECTION_OPACITY_RATE}
            />
            {/* 不可視の四角形、イベントハンドリング用 */}
            <RectPart
              width={this.props.layout.config.paperWidth}
              height={this.props.layout.config.paperHeight}
              position={position}
              opacity={0}
              onLeftClick={this.mouseLeftDown}
              onRightClick={this.mouseRightDown}
              onMouseMove={this.onMouseMove}
            />
          </>
        }
      </>
    )
  }


  private getNearestGridPosition = (pos) => {
    const {paperWidth, paperHeight, gridSize} = this.props.layout.config
    const xNums = _.range(0, paperWidth + 1, gridSize);
    const xPos = getClosest(pos.x, xNums)
    const yNums = _.range(0, paperHeight + 1, gridSize);
    const yPos = getClosest(pos.y, yNums)
    return new Point(xPos, yPos)
  }

  private showTemporaryRailOrRailGroup = () => {
    if (this.props.builder.getRailGroupItemData()) {
      this.showTemporaryRailGroup()
    } else if (this.props.builder.getRailItemData()) {
      this.showTemporaryRail()
    } else {
      // 置けるレールが無かったら状態を戻す
      this.setState({
        phase: Phase.SET_POSITION
      })
    }
  }

  private showTemporaryRailGroup = () => {
    const {rails, openJoints} = this.props.builder.getRailGroupItemData()
    const angle = getFirstRailAngle(this.state.fixedPosition, this.props.mousePosition)

    if (! this.props.builder.temporaryRailGroup) {
      const tempRailGroup = {
        pivotJointInfo: openJoints[0],
        position: this.state.fixedPosition,
        angle: angle,
      }
      LOGGER.info('[FreeRailPlacer] TemporaryRailGroup', tempRailGroup)
      this.props.builderSetTemporaryRailGroup(tempRailGroup, rails)
    } else if (this.props.builder.temporaryRailGroup.angle !== angle) {
      const tempRailGroup = {
        pivotJointInfo: this.props.builder.temporaryRailGroup.pivotJointInfo,
        position: this.state.fixedPosition,
        angle: angle,
      }
      LOGGER.info('[FreeRailPlacer] TemporaryRailGroup', tempRailGroup)
      this.props.builderSetTemporaryRailGroup(tempRailGroup, rails)
    }
  }


  private showTemporaryRail = () => {
    const itemData = this.props.builder.getRailItemData()
    const angle = getFirstRailAngle(this.state.fixedPosition, this.props.mousePosition)

    if (_.isEmpty(this.props.builder.temporaryRails)) {
      // 仮レール未設置ならPivotJointは0
      const tempRail = {
        ...itemData,
        position: this.state.fixedPosition,
        angle: angle,
        pivotJointIndex: 0
      }
      this.props.builderSetTemporaryRail(tempRail)
    } else if (this.props.builder.temporaryRails[0].angle !== angle) {
      // 仮レールが既に存在するならPivotJointをキープ
      const tempRail = {
        ...itemData,
        position: this.state.fixedPosition,
        angle: angle,
        pivotJointIndex: this.props.builder.temporaryRails[0].pivotJointIndex
      }
      this.props.builderSetTemporaryRail(tempRail)
    }
  }

  private addRail = () => {
    // 仮レールの位置にレールを設置
    this.props.builderAddRail()
    this.setState({phase: Phase.SET_POSITION})
  }
}


/**
 * 指定の点からマウスカーソルの位置を結ぶ直線の角度をstep刻みで返す。
 * @param {paper.Point} anchor
 * @param {paper.Point} cursor
 * @param {number} step
 * @returns {number}
 */
const getFirstRailAngle = (anchor: Point, cursor: Point, step: number = 45) => {
  const diffX = cursor.x - anchor.x
  const diffY = cursor.y - anchor.y
  const angle = Math.atan2(diffY, diffX) * 180 / Math.PI
  // このやり方では 0~180度の範囲でしか分からない
  // const diff = cursor.subtract(anchor)
  // const unit = new Point(1,0)
  // const angle = Math.acos(unit.dot(diff) / (unit.length * diff.length))
  const candidates = _.range(-180, 180, step)
  return getClosest(angle, candidates)
}


export default compose<FreeRailPlacerProps, FreeRailPlacerProps|any>(
  withBuilder,
)(FreeRailPlacer)
