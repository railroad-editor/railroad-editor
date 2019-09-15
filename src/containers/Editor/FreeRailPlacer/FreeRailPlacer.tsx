import * as React from "react";
import {Point} from "paper";
import {Layer} from "react-paper-bindings";
import {getClosest} from "constants/utils";
import getLogger from "logging";
import {default as withBuilder, WithBuilderPublicProps} from "containers/hoc/withBuilder";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_EDITOR, STORE_FREE_RAIL_PLACER, STORE_LAYOUT} from "constants/stores";
import {BuilderStore, PlacingMode} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import {isRailTool, RAIL_PUTTER_MARKER_RADIUS} from "constants/tools";
import {JOINT_DETECTION_OPACITY_RATE, JOINT_FILL_COLORS} from "constants/parts";
import {EditorMode, EditorStore} from "store/editorStore";
import {reaction} from "mobx";
import CirclePart from "react-rail-components/lib/parts/primitives/CirclePart";
import RectPart from "react-rail-components/lib/parts/primitives/RectPart";
import {FreeRailPlacerStore} from "../../../store/freeRailPlacerStore";

const LOGGER = getLogger(__filename)


enum Phase {
  SET_POSITION,
  SET_POSITION_GRID,
  SET_ANGLE
}

export interface FreeRailPlacerProps {
  mousePosition: Point2D
  editor?: EditorStore
  builder?: BuilderStore
  layout?: LayoutStore
  freeRailPlacer?: FreeRailPlacerStore
}

export interface FreeRailPlacerState {
  fixedPosition: Point2D
  phase: Phase
  steppedAngle: number
  isError: boolean
}

type FreeRailPlacerEnhancedProps = FreeRailPlacerProps & WithBuilderPublicProps


@inject(STORE_EDITOR, STORE_BUILDER, STORE_LAYOUT, STORE_FREE_RAIL_PLACER)
@observer
export class FreeRailPlacer extends React.Component<FreeRailPlacerEnhancedProps, FreeRailPlacerState> {

  marker: CirclePart

  constructor(props: FreeRailPlacerEnhancedProps) {
    super(props)
    this.state = {
      fixedPosition: null,
      phase: Phase.SET_POSITION,
      steppedAngle: 0,
      isError: false
    }

    // 自由設置モードの差分距離がセットされた時、ジョイントの位置に基づいてレール位置を固定する
    reaction(() => this.props.freeRailPlacer.freePlacingDifference,
      (position) => {
        if (this.isActive()) {
          let newPosition = new Point(this.props.freeRailPlacer.clickedJointPosition).add(new Point(position))
          this.setState({
            fixedPosition: newPosition,
            phase: Phase.SET_ANGLE
          })
        }
      }
    )

    // 微調整角度が変更された時、仮レールを再描画する
    reaction(
      () => this.props.builder.adjustmentAngle,
      (angle) => {
        // 現在仮レールを表示しているレールであれば、仮レールを再描画する
        if (this.isActive()) {
          this.showTemporaryRailOrRailGroup()
        }
      }
    )
  }

  onLeftClickOnPaper = (e: MouseEvent) => {
    // このハンドラはSET_ANGLE フェーズのみで呼び出される
    // 位置が決定済みならば角度を決定する
    if (this.state.phase === Phase.SET_ANGLE) {
      this.onSetAngle()
    } else {
      // そうでなければ位置を決定する
      this.onSetPosition()
    }
  }

  onLeftClickOnMarker = (e: MouseEvent) => {
    if (this.state.phase === Phase.SET_ANGLE) {
      // 位置が決定済みならば、マーカー上で左クリックすると設置をキャンセルする
      this.onResetPosition()
    } else {
      // そうでなければ位置を決定する
      this.onSetPosition()
    }
  }

  onRightClickOnPaper = (e: MouseEvent) => {
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

  isPointOnPaper = (point: Point2D, margin: number = 2) => {
    return (0 - margin <= point.x && point.x <= this.props.layout.config.paperWidth + margin)
      && (0 - margin <= point.y && point.y <= this.props.layout.config.paperHeight + margin)
  }

  onSetPosition = () => {
    let position = this.getMarkerPosition()
    if (this.isPointOnPaper(position)) {
      this.setState({
        fixedPosition: this.getMarkerPosition(),
        phase: Phase.SET_ANGLE
      })
    }
  }

  onResetPosition = () => {
    this.setState({
      fixedPosition: null,
      phase: Phase.SET_POSITION
    })
    this.props.builder.deleteTemporaryRail()
  }

  onSetAngle = () => {
    this.addRail()
  }

  onMouseMove = (e: MouseEvent | any) => {
    // Shiftキーを押している間はグリッド設置モードに移行する
    if (! e.modifiers.shift && this.state.phase === Phase.SET_POSITION_GRID) {
      this.setState({phase: Phase.SET_POSITION})
    }
    if (e.modifiers.shift && this.state.phase === Phase.SET_POSITION) {
      this.setState({phase: Phase.SET_POSITION_GRID})
    }
    // 角度決定フェーズでは仮レールを表示する
    if (this.state.phase === Phase.SET_ANGLE) {
      this.showTemporaryRailOrRailGroup()
      // もし仮レールが既存のレールと衝突する場合はマーカーをエラー表示にする
      if (this.props.builder.intersects) {
        this.setState({isError: true})
        this.marker.path.bringToFront()
      } else {
        this.setState({isError: false})
      }
    }
  }

  isActive = () => {
    return this.props.editor.mode === EditorMode.BUILDER &&
      isRailTool(this.props.builder.activeTool) &&
      this.props.builder.placingMode === PlacingMode.FREE
  }

  render() {
    let radius, position, opacity

    switch (this.state.phase) {
      case Phase.SET_POSITION:
        radius = 0
        position = this.getMarkerPosition()
        opacity = 0
        break
      case Phase.SET_POSITION_GRID:
        radius = RAIL_PUTTER_MARKER_RADIUS
        position = this.getMarkerPosition()
        opacity = JOINT_DETECTION_OPACITY_RATE
        break
      case Phase.SET_ANGLE:
        radius = RAIL_PUTTER_MARKER_RADIUS
        // 位置が定まっていたらもう動かさない
        position = this.state.fixedPosition
        opacity = JOINT_DETECTION_OPACITY_RATE
        break
    }

    return (
      <>
        <Layer name={'freeRailPlacer'}>
          {
            /* 不可視の四角形、イベントハンドリング用 */
            this.isActive() &&
            <RectPart
              width={this.props.layout.config.paperWidth}
              height={this.props.layout.config.paperHeight}
              position={position}
              opacity={0}
              onLeftClick={this.onLeftClickOnPaper}
              onRightClick={this.onRightClickOnPaper}
              onMouseMove={this.onMouseMove}
            />
          }
        </Layer>
        {
          /* マーカー */
          this.isActive() && this.state.phase != Phase.SET_POSITION &&
          <CirclePart
            radius={radius}
            position={position}
            fillColor={this.state.isError ? 'red' : JOINT_FILL_COLORS[2]}
            opacity={opacity}
            onLeftClick={this.onLeftClickOnMarker}
            onRightClick={this.onRightClickOnPaper}
            onMouseMove={this.onMouseMove}
            ref={r => this.marker = r}
          />
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
    const angle = getSteppedAngleByMousePosition(this.state.fixedPosition, this.props.mousePosition)

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
    const steppedAngle = getSteppedAngleByMousePosition(this.state.fixedPosition, this.props.mousePosition)
    const angle = steppedAngle + this.props.builder.adjustmentAngle

    if (this.state.steppedAngle !== steppedAngle) {
      console.log('reset angle')
      this.props.builder.setAdjustmentAngle(0)
    }

    if (_.isEmpty(this.props.builder.temporaryRails)) {
      // 仮レール未設置ならPivotJointは0
      const tempRail = {
        ...itemData,
        position: {x: this.state.fixedPosition.x, y: this.state.fixedPosition.y},
        angle: angle,
        pivotJointIndex: 0
      }
      this.props.builderSetTemporaryRail(tempRail)
    } else if (this.props.builder.temporaryRails[0].angle !== angle) {
      // 仮レールが既に存在するならPivotJointをキープ
      const tempRail = {
        ...itemData,
        position: {x: this.state.fixedPosition.x, y: this.state.fixedPosition.y},
        angle: angle,
        pivotJointIndex: this.props.builder.temporaryRails[0].pivotJointIndex
      }
      this.props.builderSetTemporaryRail(tempRail)
    }
    this.setState({steppedAngle})
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
const getSteppedAngleByMousePosition = (anchor: Point2D, cursor: Point2D, step: number = 15) => {
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


export default compose<FreeRailPlacerEnhancedProps, FreeRailPlacerProps>(
  withBuilder,
)(FreeRailPlacer)
