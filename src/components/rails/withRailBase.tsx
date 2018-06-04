import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import getLogger from "logging";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {FeederInfo, RailBase, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import {RailData} from "components/rails/index";
import {compose} from "recompose";
import {BuilderStore} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {FlowDirection} from "components/rails/parts/primitives/PartBase";
import {PivotInfo} from "components/rails/parts/RailPartBase";

const LOGGER = getLogger(__filename)


export interface WithRailBaseProps {
  // Injected Props
  onRailPartLeftClick: (e: MouseEvent) => boolean
  onRailPartRightClick: (e: MouseEvent) => boolean
  onJointLeftClick: (jointId: number, e: MouseEvent) => boolean
  onJointRightClick: (jointId: number, e: MouseEvent) => boolean
  onJointMouseMove: (jointId: number, e: MouseEvent) => void
  onJointMouseEnter: (jointId: number, e: MouseEvent) => void
  onJointMouseLeave: (jointId: number, e: MouseEvent) => void
  onFeederSocketMouseEnter: (feederIndex: number, e: MouseEvent) => void
  onFeederSocketMouseLeave: (feederIndex: number, e: MouseEvent) => void
  onFeederSocketLeftClick: (feederIndex: number, e: MouseEvent) => void
  onFeederSocketRightClick: (feederIndex: number, e: MouseEvent) => void
  onFeederLeftClick: (id: number, e: MouseEvent) => void
  onGapJoinerSocketMouseEnter: (jointId: number, e: MouseEvent) => void
  onGapJoinerSocketMouseLeave:(jointId: number, e: MouseEvent) => void
  onGapJoinerSocketLeftClick: (jointId: number, e: MouseEvent) => void
  onGapJoinerLeftClick: (id: number, e: MouseEvent) => void

  onMount?: (ref: RailBase<any, RailBaseState>) => void
  onUnmount?: (ref: RailBase<any, RailBaseState>) => void

  builder?: BuilderStore
  layout?: LayoutStore
}

export type RailBaseEnhancedProps = RailBaseProps & WithRailBaseProps & WithBuilderPublicProps


/**
 * Railの各種イベントハンドラを提供するHOC
 * 依存: WithBuilder
 */
export default function withRailBase(WrappedComponent: React.ComponentClass<RailBaseProps>) {


  @inject(STORE_BUILDER, STORE_LAYOUT)
  @observer
  class WithRailBase extends React.Component<RailBaseEnhancedProps, {}> {

    rail: RailBase<any, any>

    constructor(props: RailBaseEnhancedProps) {
      super(props)

      this.onRailPartLeftClick = this.onRailPartLeftClick.bind(this)
      this.onRailPartRightClick = this.onRailPartRightClick.bind(this)
      this.onJointLeftClick = this.onJointLeftClick.bind(this)
      this.onJointRightClick = this.onJointRightClick.bind(this)
      this.onJointMouseMove = this.onJointMouseMove.bind(this)
      this.onJointMouseEnter = this.onJointMouseEnter.bind(this)
      this.onJointMouseLeave = this.onJointMouseLeave.bind(this)
      this.onFeederSocketLeftClick = this.onFeederSocketLeftClick.bind(this)
    }

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
     * ギャップジョイナー上でマウスを左クリックすると、ギャップジョイナーの選択状態をトグルする。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onGapJoinerLeftClick = (id: number, e: MouseEvent) => {
      const target = this.props.layout.currentLayoutData.gapJoiners.find(gapJoiner => gapJoiner.id === id)
      this.props.layout.updateGapJoiner({
          id: target.id,
          selected: !target.selected
        }
      )
    }

    addGapJoiner = (jointId: number) => {
      this.props.layout.addGapJoiner({
        id: 0,
        railId: this.rail.props.id,
        jointId: jointId,
        selected: false
      })
    }


    /**
     * フィーダーソケット上にマウスが乗ったら、仮フィーダーを表示する。
     * @param {number} feederIndex
     * @param {MouseEvent} e
     */
    onFeederSocketMouseEnter = (feederIndex: number, e: MouseEvent) => {
      this.showTemporaryFeeder(feederIndex)
    }

    /**
     * フィーダーソケット上からマウスが離れたら、仮フィーダーを削除する。
     * @param {number} feederIndex
     * @param {MouseEvent} e
     */
    onFeederSocketMouseLeave = (feederIndex: number, e: MouseEvent) => {
      this.props.builder.deleteTemporaryFeeder()
    }

    /**
     * フィーダーソケット上でマウスを右クリックすると、フィーダーの差し込み方向を変える。
     * @param {number} feederIndex
     * @param {MouseEvent} e
     */
    onFeederSocketRightClick = (feederIndex: number, e: MouseEvent) => {
      this.toggleTemporaryFeederDirection(feederIndex)
    }

    /**
     * フィーダーソケット上でマウスを左クリックすると、フィーダーをレイアウトに追加する。
     * @param {number} feederIndex
     * @param {MouseEvent} e
     * @returns {boolean}
     */
    onFeederSocketLeftClick = (feederIndex: number, e: MouseEvent) => {
      this.addFeeder(feederIndex)
      this.props.builder.deleteTemporaryFeeder()
      return true
    }

    /**
     * フィーダー上でマウスを左クリックすると、フィーダーの選択状態をトグルする。
     * @param {number} id
     * @param {MouseEvent} e
     */
    onFeederLeftClick = (id: number, e: MouseEvent) => {
      const target = this.props.layout.currentLayoutData.feeders.find(feeder => feeder.id === id)
      this.props.layout.updateFeeder({
          id: target.id,
          selected: !target.selected
        }
      )
    }

    addFeeder = (feederIndex: number) => {
      this.props.layout.addFeeder(this.props.builder.temporaryFeeder)
    }

    showTemporaryFeeder = (feederIndex: number) => {
      // このフィーダーソケットのPivotInfoからフィーダーデータを作成
      const pivotInfo = this.rail.railPart.feederSockets[feederIndex]
      this.props.builder.setTemporaryFeeder({
        id: -1,
        railId: this.rail.props.id,
        socketId: pivotInfo.pivotPartIndex,
        pivot: pivotInfo.pivot,
        direction: FlowDirection.START_TO_END,
        selected: false
      })
    }

    toggleTemporaryFeederDirection = (feederIndex: number) => {
      let direction
      switch (this.props.builder.temporaryFeeder.direction) {
        case FlowDirection.START_TO_END:
          direction = FlowDirection.END_TO_START
          break
        case FlowDirection.END_TO_START:
          direction = FlowDirection.START_TO_END
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
      // 矩形選択中は仮レールを表示させない
      if (this.props.builder.selecting) return

      if (this.props.builderGetRailGroupItemData()) {
        this.showTemporaryRailGroup(jointId)
      } else if (this.props.builderGetRailItemData()) {
        this.showTemporaryRail(jointId)
      }
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
    }


    /**
     * ジョイントを左クリックしたら、仮レールの位置にレールを設置する
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointLeftClick = (jointId: number, e: MouseEvent) => {
      // 仮レールがこのレイヤーの他のレールと重なっていたら、何もせずに返る
      if (this.props.builder.intersects) {
        // ジョイントの検出状態を変更させない
        return false
      }

      if (_.isEmpty(this.props.builder.temporaryRails)) {
        return false
      }

      this.props.builderAddRail()
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
      // ジョイントの検出状態は変更しない
      return false
    }


    /**
     * レールパーツを左クリックしたら、レールの選択状態をトグルする。
     * Shiftを押していない場合: それ以外のレールの選択状態を解除する
     * Shiftを押している場合: それ以外のレールの選択状態を解除しない
     * @param {MouseEvent} e
     */
    onRailPartLeftClick(e: MouseEvent|any) {
      // レールの選択状態をトグルする
      this.props.builderToggleRail(this.props, !e.modifiers.shift)
      LOGGER.info(`${this.props.id} clicked.`)
      return true
    }


    /**
     * レールパーツを右クリックした場合
     * 現状何もしない
     * @param {MouseEvent} e
     */
    onRailPartRightClick(e: MouseEvent) {
      return true
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
          onGapJoinerSocketMouseEnter={this.onGapJoinerSocketMouseEnter}
          onGapJoinerSocketMouseLeave={this.onGapJoinerSocketMouseLeave}
          onGapJoinerSocketLeftClick={this.onGapJoinerSocketLeftClick}
          onGapJoinerLeftClick={this.onGapJoinerLeftClick}
          onRailPartLeftClick={this.onRailPartLeftClick}
          onRailPartRightClick={this.onRailPartRightClick}
          onMount={(instance) => this.onMount(instance)}
          onUnmount={(instance) => this.onUnmount(instance)}
        />
      )
    }


    /**
     * 仮レールグループを表示する
     * @param {number} jointId
     */
    private showTemporaryRailGroup = (jointId: number) => {
      const {rails, openJoints} = this.props.builderGetRailGroupItemData()

      // PivotJointの設定
      let pivotJointInfo
      if (this.props.builder.temporaryRailGroup == null) {
        pivotJointInfo = openJoints[0]
      } else {
        pivotJointInfo = this.props.builder.temporaryRailGroup.pivotJointInfo
      }

      // レールグループデータの作成
      const railGroup = {
        pivotJointInfo: pivotJointInfo,
        position: this.railPart.getGlobalJointPosition(jointId),
        angle: this.railPart.getGlobalJointAngle(jointId),
      }

      this.props.builderSetTemporaryRailGroup(railGroup, rails)
    }


    /**
     * 仮レールを表示する。
     * @param {number} jointId
     */
    private showTemporaryRail = (jointId: number) => {
      const railData = this.props.builderGetRailItemData()
      // PivotJointを設定する
      let pivotJointIndex
      if (_.isEmpty(this.props.builder.temporaryRails)) {
        pivotJointIndex = this.initializePivotJointIndex(railData)
      } else {
        pivotJointIndex = this.props.builder.temporaryRails[0].pivotJointIndex
      }

      // 仮レールを設置する
      this.props.builderSetTemporaryRail({
        ...railData,
        position: this.railPart.getGlobalJointPosition(jointId),
        angle: this.railPart.getGlobalJointAngle(jointId),
        pivotJointIndex: pivotJointIndex,
      })
      LOGGER.info('TemporaryRail', railData)
    }


    private initializePivotJointIndex = (paletteRailData: RailData) => {
      // このレールと仮レールの両方がカーブレールの場合、PivotJoint (=向き)を揃える
      if (this.props.type === 'CurveRail' && paletteRailData.type === 'CurveRail') {
        return this.props.pivotJointIndex
      } else {
        return 0
      }
    }

  }

  return compose<WithRailBaseProps, WithRailBaseProps|any>(
    withBuilder,
  )(WithRailBase)
}

