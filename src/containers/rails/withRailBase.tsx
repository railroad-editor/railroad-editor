import * as React from "react";
import getLogger from "logging";
import {RailData} from "./index";
import {BuilderStore, PlacingMode} from "stores/builderStore";
import {LayoutStore} from "stores/layoutStore";
import {inject, observer} from "mobx-react";
import {isRailTool, Tools} from "constants/tools";
import {FlowDirection} from "react-rail-components/lib/parts/primitives/PartBase";
import {ArcDirection} from "react-rail-components/lib/parts/primitives/ArcPart";
import {RailBase, RailBaseProps, RailBaseState} from "react-rail-components";
import {MeasureStore} from "stores/measureStore";
import {FreeRailPlacerStore} from "stores/freeRailPlacerStore";
import {RailToolUseCase} from "useCases/railToolUseCase";
import {SelectionToolUseCase} from "useCases/selectionToolUseCase";
import {USECASE_RAIL_TOOL, USECASE_SELECTION} from "constants/useCases";
import {STORE_BUILDER, STORE_FREE_RAIL_PLACER, STORE_LAYOUT, STORE_MEASURE} from "constants/stores";

const LOGGER = getLogger(__filename)


export interface WithRailBaseProps {
  // Injected Props
  onRailPartLeftClick: (e: MouseEvent) => boolean
  onRailPartRightClick: (e: MouseEvent) => boolean
  onRailPartMouseEnter: (e: MouseEvent) => void
  onRailPartMouseLeave: (e: MouseEvent) => void
  onRailPartMouseMove: (e: MouseEvent) => void

  onJointLeftClick: (jointId: number, e: MouseEvent) => boolean
  onJointRightClick: (jointId: number, e: MouseEvent) => boolean
  onJointMouseMove: (jointId: number, e: MouseEvent) => void
  onJointMouseEnter: (jointId: number, e: MouseEvent) => void
  onJointMouseLeave: (jointId: number, e: MouseEvent) => void

  onFeederSocketMouseEnter: (socketId: number, e: MouseEvent) => void
  onFeederSocketMouseLeave: (socketId: number, e: MouseEvent) => void
  onFeederSocketLeftClick: (socketId: number, e: MouseEvent) => void
  onFeederSocketRightClick: (socketId: number, e: MouseEvent) => void
  onFeederLeftClick: (id: number, e: MouseEvent) => void
  onFeederMouseEnter: (id: number, e: MouseEvent) => void
  onFeederMouseLeave: (id: number, e: MouseEvent) => void

  onGapJoinerSocketMouseEnter: (jointId: number, e: MouseEvent) => void
  onGapJoinerSocketMouseLeave: (jointId: number, e: MouseEvent) => void
  onGapJoinerSocketLeftClick: (jointId: number, e: MouseEvent) => void
  onGapJoinerLeftClick: (id: number, e: MouseEvent) => void
  onGapJoinerMouseEnter: (id: number, e: MouseEvent) => void
  onGapJoinerMouseLeave: (id: number, e: MouseEvent) => void
  showTemporaryRailOrRailGroup: (id: number) => void

  onMount?: (ref: RailBase<any, RailBaseState>) => void
  onUnmount?: (ref: RailBase<any, RailBaseState>) => void

  builder?: BuilderStore
  layout?: LayoutStore
  measure?: MeasureStore
  freeRailPlacer?: FreeRailPlacerStore
  selectionToolUseCase?: SelectionToolUseCase
  railToolUseCase?: RailToolUseCase
}

export type RailBaseEnhancedProps = RailBaseProps & WithRailBaseProps


/**
 * Railの各種イベントハンドラを提供するHOC
 */
export default function withRailBase(WrappedComponent: React.ComponentClass<RailBaseEnhancedProps>) {


  @inject(STORE_BUILDER, STORE_LAYOUT, STORE_MEASURE, STORE_FREE_RAIL_PLACER, USECASE_SELECTION, USECASE_RAIL_TOOL)
  @observer
  class WithRailBase extends React.Component<RailBaseEnhancedProps, {}> {

    rail: RailBase<any, any>

    get railPart() {
      return this.rail.railPart
    }

    get joints() {
      return this.rail.joints
    }

    onGapJoinerSocketMouseEnter = (jointId: number) => {
    }

    onGapJoinerSocketMouseLeave = (jointId: number) => {
    }

    /**
     * ギャップジョイナーソケット上でマウスを左クリックすると、ギャップジョイナーを追加する。
     * @param {number} jointId
     * @returns {boolean}
     */
    onGapJoinerSocketLeftClick = (jointId: number) => {
      this.addGapJoiner(jointId)
      return true
    }

    /**
     * ギャップジョイナーにマウスが乗ると、カーソルの形状を変更する。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onGapJoinerMouseEnter = (id: number, e: MouseEvent) => {
      if (this.props.builder.activeTool === Tools.GAP_JOINERS) {
        document.body.style.cursor = 'pointer'
      }
    }

    /**
     * ギャップジョイナーからマウスが離れたら、カーソルの形状を戻す。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onGapJoinerMouseLeave = (id: number, e: MouseEvent) => {
      this.props.builder.setCursorShape(this.props.builder.activeTool)
    }

    /**
     * ギャップジョイナー上でマウスを左クリックすると、ギャップジョイナーの選択状態をトグルする。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onGapJoinerLeftClick = (id: number, e: MouseEvent) => {
      if (this.props.builder.activeTool === Tools.GAP_JOINERS) {
        this.props.selectionToolUseCase.toggleSelectGapJoiner(id)
      }
    }

    private addGapJoiner = (jointId: number) => {
      this.props.layout.addGapJoiner({
        id: 0,
        railId: this.rail.props.id,
        jointId: jointId,
        selected: false
      })
    }


    /**
     * フィーダーソケットにマウスが乗ったら、仮フィーダーを表示する。
     * @param {number} socketId
     * @param {MouseEvent} e
     */
    onFeederSocketMouseEnter = (socketId: number, e: MouseEvent) => {
      this.showTemporaryFeeder(socketId)
    }

    /**
     * フィーダーソケットからマウスが離れたら、仮フィーダーを削除する。
     * @param {number} socketId
     * @param {MouseEvent} e
     */
    onFeederSocketMouseLeave = (socketId: number, e: MouseEvent) => {
      this.props.builder.updateTemporaryFeeder({
        visible: false
      })
    }

    /**
     * フィーダーソケット上でマウスを右クリックすると、フィーダーの差し込み方向を変える。
     * @param {number} socketId
     * @param {MouseEvent} e
     */
    onFeederSocketRightClick = (socketId: number, e: MouseEvent) => {
      this.toggleTemporaryFeederDirection(socketId)
    }

    /**
     * フィーダーソケット上でマウスを左クリックすると、フィーダーをレイアウトに追加する。
     * @param {number} socketId
     * @param {MouseEvent} e
     * @returns {boolean}
     */
    onFeederSocketLeftClick = (socketId: number, e: MouseEvent) => {
      this.addFeeder(socketId)
      this.props.builder.deleteTemporaryFeeder()
      return true
    }

    /**
     * フィーダーにマウスが乗ったら、カーソルの形状を変更する。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onFeederMouseEnter = (id: number, e: MouseEvent) => {
      if (this.props.builder.activeTool === Tools.FEEDERS) {
        document.body.style.cursor = 'pointer'
      }
    }

    /**
     * フィーダーからマウスが離れたら、カーソルの形状を戻す。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onFeederMouseLeave = (id: number, e: MouseEvent) => {
      this.props.builder.setCursorShape(this.props.builder.activeTool)
    }

    /**
     * フィーダー上でマウスを左クリックすると、フィーダーの選択状態をトグルする。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onFeederLeftClick = (id: number, e: MouseEvent) => {
      if (this.props.builder.activeTool === Tools.FEEDERS) {
        this.props.selectionToolUseCase.toggleSelectFeeder(id)
      }
    }


    private addFeeder = (socketId: number) => {
      this.props.layout.addFeeder(this.props.builder.temporaryFeeder)
    }

    private showTemporaryFeeder = (socketId: number) => {
      const pivotInfo = this.rail.railPart.feederSockets[socketId]
      const feederData = {
        id: -1,
        railId: this.rail.props.id,
        socketId: pivotInfo.pivotPartIndex,
        pivot: pivotInfo.pivot,
        direction: FlowDirection.LEFT_TO_RIGHT,
        selected: false,
        visible: true,
        name: '',
        isError: false,
      }
      // 既に存在するなら向きを保存する
      if (this.props.builder.temporaryFeeder) {
        feederData.direction = this.props.builder.temporaryFeeder.direction
      }
      // このフィーダーソケットのPivotInfoからフィーダーデータを作成
      this.props.builder.setTemporaryFeeder(feederData)
    }

    private toggleTemporaryFeederDirection = (socketId: number) => {
      let direction
      switch (this.props.builder.temporaryFeeder.direction) {
        case FlowDirection.LEFT_TO_RIGHT:
          direction = FlowDirection.RIGHT_TO_LEFT
          break
        case FlowDirection.RIGHT_TO_LEFT:
          direction = FlowDirection.LEFT_TO_RIGHT
          break
      }
      this.props.builder.updateTemporaryFeeder({
        id: -1,
        direction: direction,
      })
    }


    /**
     * ジョイントにマウスが乗ったら、仮レールを表示する
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointMouseEnter = (jointId: number, e: MouseEvent) => {
      let activeTool = this.props.builder.activeTool
      if (isRailTool(activeTool)) {
        this.onJointMouseEnterForRailTools(jointId, e)
      }
    }

    onJointMouseEnterForRailTools = (jointId: number, e: MouseEvent) => {
      // 矩形選択中は仮レールを表示させない
      if (this.props.builder.selecting) return
      // 自由設置モードの場合は何もしない
      if (this.props.builder.placingMode === PlacingMode.FREE) return

      // 仮レール表示ジョイントをセットする
      this.props.builder.setCurrentJoint(this.rail.props.id, jointId)
      // 微調整角度をリセットする
      this.props.builder.setAdjustmentAngle(0)

      this.showTemporaryRailOrRailGroup(jointId)
    }

    /**
     * ジョイント上でマウスが動いた場合
     * レールの重なりを検出した場合、ジョイントの表示をエラーにする
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointMouseMove = (jointId: number, e: MouseEvent) => {
      if (this.props.builder.intersects) {
        this.joints[jointId].part.setState({
          isError: true
        })
      } else {
        this.joints[jointId].part.setState({
          isError: false
        })
      }
    }


    /**
     * ジョイントからマウスが離れたら、仮レールを隠す
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointMouseLeave = (jointId: number, e: MouseEvent) => {
      // PivotJointIndexを保存しておきたいので、削除するのではなく不可視にする
      this.props.builder.updateTemporaryRail({visible: false})
      // 仮レール表示ジョイントをリセットする
      this.props.builder.setCurrentJoint(null, null)
      // 微調整角度をリセットする
      this.props.builder.setAdjustmentAngle(0)
    }


    onJointLeftClick = (jointId: number, e: MouseEvent) => {
      let activeTool = this.props.builder.activeTool
      let shouldChangeJointState = false
      if (isRailTool(activeTool)) {
        shouldChangeJointState = this.onJointLeftClickForRailTool(jointId, e)
      } else if (activeTool === Tools.MEASURE) {
        shouldChangeJointState = this.onJointLeftClickForMeasureTool(jointId, e)
      }
      // 仮レール表示ジョイントをリセットする
      this.props.builder.setCurrentJoint(null, null)
      // 微調整角度をリセットする
      this.props.builder.setAdjustmentAngle(0)
      return shouldChangeJointState
    }

    onJointLeftClickForMeasureTool = (jointId: number, e: MouseEvent) => {
      const start = this.props.measure.startPosition
      const end = this.props.measure.endPosition
      if ((! start && ! end) || (start && end)) {
        this.props.measure.setEndPosition(null)
        this.props.measure.setStartPosition(this.joints[jointId].globalPosition)
      }
      if (start && ! end) {
        this.props.measure.setEndPosition(this.joints[jointId].globalPosition)
      }
      return false
    }

    /**
     * ジョイントを左クリックしたら、仮レールの位置にレールを設置する
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointLeftClickForRailTool = (jointId: number, e: MouseEvent) => {
      if (this.props.builder.placingMode === PlacingMode.FREE) {
        // クリックしたジョイントの位置を記録し、ダイアログを表示する
        this.props.freeRailPlacer.setClickedJointPosition(this.joints[jointId].globalPosition)
        this.props.freeRailPlacer.setFreePlacingDialog(true)
        return false
      }
      // Joint Placing Mode
      if (_.isEmpty(this.props.builder.temporaryRails)) {
        return false
      }
      this.props.railToolUseCase.addRail()
      // 検出済状態に移行する
      return true
    }


    /**
     * ジョイントを右クリックしたら、仮レールが接続するジョイントを変更する
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointRightClick = (jointId: number, e: MouseEvent) => {
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
      // 仮レールの衝突判定を行う
      this.props.railToolUseCase.checkIntersections()
      // ジョイントのエラー状態を即座に反映する
      this.onJointMouseMove(jointId, e)

      // ジョイントを検出状態のままでキープする
      return false
    }

    onRailPartMouseEnter = (e: MouseEvent): void => {
      if (! this.props.builder.usingRailTools || this.props.opacity !== 1) {
        return
      }
      document.body.style.cursor = 'pointer'
    }

    onRailPartMouseLeave = (e: MouseEvent) => {
      this.props.builder.setCursorShape(this.props.builder.activeTool)
    }

    onRailPartMouseMove = (e: MouseEvent) => {
      this.onRailPartMouseEnter(e)
    }

    /**
     * レールパーツを左クリックしたら、レールの選択状態をトグルする。
     * Shiftを押していない場合: それ以外のレールの選択状態を解除する
     * Shiftを押している場合: それ以外のレールの選択状態を解除しない
     * @param {MouseEvent} e
     */
    onRailPartLeftClick = (e: MouseEvent | any) => {
      // レールの選択状態をトグルする。半透明なら何もしない
      if (! this.props.builder.usingRailTools) {
        return false
      }
      if (this.props.opacity !== 1) {
        return false
      }
      if (e.modifiers.shift) {
        this.props.selectionToolUseCase.selectRail(this.props.id, ! this.props.selected)
      } else {
        this.props.selectionToolUseCase.toggleSelectRail(this.props.id)
      }
      LOGGER.info(`${this.props.id} clicked.`)
      return false
    }


    /**
     * レールパーツを右クリックした場合
     * 現状何もしない
     * @param {MouseEvent} e
     */
    onRailPartRightClick = (e: MouseEvent) => {
      return false
    }


    /**
     * マウント時に呼ばれるコールバック
     * RailComponentクラスを取得するために用いる
     */
    onMount = (ref: RailBase<any, RailBaseState>) => {
      this.rail = ref
      if (this.props.onMount) {
        this.props.onMount(ref)
      }
    }


    /**
     * アンマウント時に呼ばれるコールバック
     */
    onUnmount = (ref: RailBase<any, RailBaseState>) => {
      if (this.props.onUnmount) {
        this.props.onUnmount(ref)
      }
    }


    render() {
      // ストアは除外する
      const props = _.omit(this.props, ['builder', 'layout'])

      return (
        <WrappedComponent
          {...props}
          onJointMouseEnter={this.onJointMouseEnter}
          onJointMouseMove={this.onJointMouseMove}
          onJointMouseLeave={this.onJointMouseLeave}
          onJointLeftClick={this.onJointLeftClick}
          onJointRightClick={this.onJointRightClick}
          onFeederSocketMouseEnter={this.onFeederSocketMouseEnter}
          onFeederSocketMouseLeave={this.onFeederSocketMouseLeave}
          onFeederSocketLeftClick={this.onFeederSocketLeftClick}
          onFeederSocketRightClick={this.onFeederSocketRightClick}
          onFeederLeftClick={this.onFeederLeftClick}
          onFeederMouseEnter={this.onFeederMouseEnter}
          onFeederMouseLeave={this.onFeederMouseLeave}
          onGapJoinerSocketMouseEnter={this.onGapJoinerSocketMouseEnter}
          onGapJoinerSocketMouseLeave={this.onGapJoinerSocketMouseLeave}
          onGapJoinerSocketLeftClick={this.onGapJoinerSocketLeftClick}
          onGapJoinerLeftClick={this.onGapJoinerLeftClick}
          onGapJoinerMouseEnter={this.onGapJoinerMouseEnter}
          onGapJoinerMouseLeave={this.onGapJoinerMouseLeave}
          onRailPartLeftClick={this.onRailPartLeftClick}
          onRailPartRightClick={this.onRailPartRightClick}
          onRailPartMouseEnter={this.onRailPartMouseEnter}
          onRailPartMouseLeave={this.onRailPartMouseLeave}
          onRailPartMouseMove={this.onRailPartMouseMove}
          onMount={this.onMount}
          onUnmount={this.onUnmount}
          showTemporaryRailOrRailGroup={this.showTemporaryRailOrRailGroup}
        />
      )
    }


    showTemporaryRailOrRailGroup = (jointId: number) => {
      if (this.props.builder.getRailGroupItemData()) {
        this.showTemporaryRailGroup(jointId)
      } else if (this.props.builder.getRailItemData()) {
        this.showTemporaryRail(jointId)
      }
    }

    /**
     * 仮レールグループを表示する
     * @param {number} jointId
     */
    private showTemporaryRailGroup = (jointId: number) => {
      const {rails, openJoints} = this.props.builder.getRailGroupItemData()

      // PivotJointの設定
      let pivotJointInfo
      if (this.props.builder.temporaryRailGroup == null) {
        pivotJointInfo = openJoints[0]
      } else {
        pivotJointInfo = this.props.builder.temporaryRailGroup.pivotJointInfo
      }

      const position = this.railPart.getGlobalJointPosition(jointId)
      // レールグループデータの作成
      const railGroup = {
        pivotJointInfo: pivotJointInfo,
        position: {x: position.x, y: position.y},
        angle: this.railPart.getGlobalJointAngle(jointId) + this.props.builder.adjustmentAngle
      }

      this.props.railToolUseCase.setTemporaryRailGroup(railGroup, rails)
    }


    /**
     * 仮レールを表示する。
     * @param {number} jointId
     */
    private showTemporaryRail = (jointId: number) => {
      const railData = this.props.builder.getRailItemData()
      // PivotJointを設定する
      let pivotJointIndex
      if (_.isEmpty(this.props.builder.temporaryRails)) {
        pivotJointIndex = this.initializePivotJointIndex(railData)
      } else {
        pivotJointIndex = this.props.builder.temporaryRails[0].pivotJointIndex
      }

      const position = this.railPart.getGlobalJointPosition(jointId)
      // 仮レールを設置する
      this.props.railToolUseCase.setTemporaryRail({
        ...railData,
        position: {x: position.x, y: position.y},
        angle: this.railPart.getGlobalJointAngle(jointId) + this.props.builder.adjustmentAngle,
        pivotJointIndex: pivotJointIndex,
      })
      LOGGER.info('TemporaryRail', railData)
    }


    private initializePivotJointIndex = (paletteRailData: RailData) => {
      // このレールと仮レールの両方がカーブレールの場合、PivotJoint (=向き)を揃える
      if (this.props.type === 'CurveRail' && paletteRailData.type === 'CurveRail') {
        return this.props.pivotJointIndex
      } else if (this.props.type === 'CurvedTurnout' && (this.props as any).branchDirection === ArcDirection.LEFT) {
        return 1
      } else {
        return 0
      }
    }

  }

  return WithRailBase
}

