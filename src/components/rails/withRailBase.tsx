import * as React from "react";
import {Rectangle} from "react-paper-bindings";
import getLogger from "logging";
import {RootState} from "store/type";
import {updateTemporaryItem, updateTemporaryRailGroup} from "actions/builder";
import withBuilder, {WithBuilderPublicProps} from "components/hoc/withBuilder";
import {nextPivotJointIndex, nextPivotJointInfo} from "selectors";
import {JointInfo, RailBase, RailBaseProps, RailBaseState} from "components/rails/RailBase";
import {connect} from "react-redux";
import {RailData, RailGroupData} from "components/rails/index";
import {compose} from "recompose";

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
  onMount?: (ref: RailBase<RailBaseProps, RailBaseState>) => void
  onUnmount?: (ref: RailBase<RailBaseProps, RailBaseState>) => void

  // states
  temporaryRails: RailData[]
  temporaryRailGroup: RailGroupData
  activeLayerId: number
  nextPivotJointIndex: number
  nextPivotJointInfo: JointInfo
  intersects: boolean

  // actionssetTemporaryRail
  updateTemporaryRail: (item: Partial<RailData>) => void
  updateTemporaryRailGroup: (item: Partial<RailGroupData>) => void
}

export type RailBaseEnhancedProps = RailBaseProps & WithRailBaseProps & WithBuilderPublicProps


/**
 * Railの各種イベントハンドラを提供するHOC
 * 依存: WithBuilder
 */
export default function withRailBase(WrappedComponent: React.ComponentClass<RailBaseProps>) {

  const mapStateToProps = (state: RootState): Partial<WithRailBaseProps> => {
    return {
      temporaryRails: state.builder.temporaryRails,
      temporaryRailGroup: state.builder.temporaryRailGroup,
      activeLayerId: state.builder.activeLayerId,
      nextPivotJointIndex: nextPivotJointIndex(state),
      nextPivotJointInfo: nextPivotJointInfo(state),
      intersects: state.builder.intersects,
    }
  }

  const mapDispatchToProps = (dispatch: any): Partial<WithRailBaseProps> => {
    return {
      updateTemporaryRail: (item: Partial<RailData>) => dispatch(updateTemporaryItem(item)),
      updateTemporaryRailGroup: (item: Partial<RailGroupData>) => dispatch(updateTemporaryRailGroup(item)),
    }
  }

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
    }

    get railPart() {
      return this.rail.railPart
    }

    get joints() {
      return this.rail.joints
    }

    /**
     * ジョイントにマウスが乗ったら、仮レールを表示する
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointMouseEnter = (jointId: number, e: MouseEvent) => {
      if (this.props.builderGetUserRailGroupData()) {
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
      if (this.props.intersects) {
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
      this.props.updateTemporaryRail({visible: false})
    }


    /**
     * ジョイントを左クリックしたら、仮レールの位置にレールを設置する
     * @param {number} jointId
     * @param {MouseEvent} e
     */
    onJointLeftClick = (jointId: number, e: MouseEvent) => {
      // 仮レールがこのレイヤーの他のレールと重なっていたら、何もせずに返る
      if (this.props.intersects) {
        // ジョイントの検出状態を変更させない
        return false
      }

      if (_.isEmpty(this.props.temporaryRails)) {
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
      if (this.props.temporaryRailGroup) {
        // レールグループの場合
        this.props.updateTemporaryRailGroup({
          pivotJointInfo: this.props.nextPivotJointInfo
        })
      } else if (this.props.temporaryRails) {
        // 単体レールの場合
        this.props.updateTemporaryRail({
          pivotJointIndex: this.props.nextPivotJointIndex
        })
      }
      // ジョイントの検出状態は変更しない
      return false
    }


    /**
     * レールパーツを左クリックしたら、レールの選択状態をトグルする。
     * @param {MouseEvent} e
     */
    onRailPartLeftClick(e: MouseEvent) {
      // レールの選択状態をトグルする
      this.props.builderToggleRail(this.props)
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
    onMount = (ref: RailBase<RailBaseProps, RailBaseState>) => {
      this.rail = ref
      if (this.props.onMount) {
        this.props.onMount(ref)
      }
    }


    /**
     * アンマウント時に呼ばれるコールバック
     */
    onUnmount = (ref: RailBase<RailBaseProps, RailBaseState>) => {
      if (this.props.onUnmount) {
        this.props.onUnmount(ref)
      }
    }


    render() {
      return (
        <WrappedComponent
          {...this.props}
          onJointMouseEnter={this.onJointMouseEnter}
          onJointMouseMove={this.onJointMouseMove}
          onJointMouseLeave={this.onJointMouseLeave}
          onJointLeftClick={this.onJointLeftClick}
          onJointRightClick={this.onJointRightClick}
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
      const {rails, openJoints} = this.props.builderGetUserRailGroupData()

      // PivotJointの設定
      let pivotJointInfo
      if (this.props.temporaryRailGroup == null) {
        pivotJointInfo = openJoints[0]
      } else {
        pivotJointInfo = this.props.temporaryRailGroup.pivotJointInfo
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
      if (_.isEmpty(this.props.temporaryRails)) {
        pivotJointIndex = this.initializePivotJointIndex(railData)
      } else {
        pivotJointIndex = this.props.temporaryRails[0].pivotJointIndex
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
    connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})
  )(WithRailBase)
}

