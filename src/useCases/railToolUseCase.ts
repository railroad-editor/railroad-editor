import {action, runInAction} from "mobx";
import {LayoutStore} from "stores/layoutStore";
import {getCloseJointsOf, getRailComponent, getTemporaryRailGroupComponent, intersectsOf} from "containers/rails/utils";
import {BuilderStore} from "stores/builderStore";
import {FeederUseCase} from "./feederUseCase";
import {GapJoinerUseCase} from "./gapJoinerUseCase";
import {SelectionToolUseCase} from "./selectionToolUseCase";
import {TEMPORARY_RAIL_OPACITY, Tools} from "constants/tools";
import {SwitcherUseCase} from "./switcherUseCase";
import {RailData, RailGroupData} from "containers/rails";
import {DetectionState} from "react-rail-components/lib/parts/primitives/DetectablePart";
import {LayerPaletteStore} from "stores/layerPaletteStore";
import getLogger from "../logging";
import {NEW_RAIL_GROUP, NO_RAIL_FOR_GROUP} from "constants/messages";
import {OpposingJoints} from "react-rail-components";
import {UserRailGroupData} from "stores";
import {UiStore} from "stores/uiStore";
import {I18n} from "aws-amplify";
import {JointPair} from "./types";

const LOGGER = getLogger(__filename)


export class RailToolUseCase {

  private readonly layoutStore: LayoutStore
  private readonly builderStore: BuilderStore
  private readonly layerPaletteStore: LayerPaletteStore
  private readonly uiStore: UiStore
  private readonly feederUseCase: FeederUseCase
  private readonly gapJoinerUseCase: GapJoinerUseCase
  private readonly switcherUseCase: SwitcherUseCase
  private readonly selectionToolUseCase: SelectionToolUseCase

  constructor(
    layoutStore: LayoutStore,
    builderStore: BuilderStore,
    layerPaletteStore: LayerPaletteStore,
    uiStore: UiStore,
    feederUseCase: FeederUseCase,
    gapJoinerUseCase: GapJoinerUseCase,
    switcherUseCase: SwitcherUseCase,
    selectionToolUseCase: SelectionToolUseCase
  ) {
    this.layoutStore = layoutStore
    this.builderStore = builderStore
    this.layerPaletteStore = layerPaletteStore
    this.uiStore = uiStore
    this.feederUseCase = feederUseCase
    this.gapJoinerUseCase = gapJoinerUseCase
    this.switcherUseCase = switcherUseCase
    this.selectionToolUseCase = selectionToolUseCase
  }

  setTemporaryRail = (railData: RailData) => {
    // 仮レールデータ
    const tempRail = {
      ...railData,
      id: -1,                             // 仮のレールID
      name: this.builderStore.paletteItem.name,              //
      layerId: -1,                        // 仮のレイヤーに設置
      enableJoints: false,                // ジョイントを無効化
      opacity: TEMPORARY_RAIL_OPACITY,    // 半透明
      visible: true,
    }
    // 仮レール設置
    this.builderStore.setTemporaryRail(tempRail)
    // 近傍ジョイントを検出状態に変更する
    this.setCloseJointsDetecting()
    // 重なりをチェックする
    this.checkIntersections()
  }

  setTemporaryRailGroup = (railGroupData: RailGroupData | any, childRails: RailData[]) => {
    // 仮レールグループメンバー
    const children = childRails.map((r, idx) => {
      return {
        ...r,
        id: -2 - idx,                       // 仮のレールIDを割り当て
        layerId: -1,                        // 仮のレイヤーに設置
        enableJoints: false,                // ジョイントを無効化
        opacity: TEMPORARY_RAIL_OPACITY,    // 半透明
        visible: true,
      }
    })

    // 仮レールグループデータ
    const railGroup: RailGroupData = {
      ...railGroupData,
      type: 'RailGroup',
      id: -1,                                   // 仮のレールグループIDを割り当て
      rails: children.map(c => c.id)  // メンバーレール
    }

    // 仮レールグループ設置
    this.builderStore.setTemporaryRailGroup(railGroup, children)
    // 近傍ジョイントを検出状態に変更する
    this.setCloseJointsDetecting()
    // 重なりをチェックする
    this.checkIntersections()
  }


  addRail = () => {
    const {temporaryRails, temporaryRailGroup, deleteTemporaryRail} = this.builderStore

    runInAction(() => {
      this.layoutStore.commit()

      if (temporaryRailGroup) {
        // レールグループの追加処理
        this.addRailGroup(temporaryRailGroup, temporaryRails)
      } else if (temporaryRails.length > 0) {
        // 単体のレールの追加処理
        this.addSingleRail(temporaryRails[0])
      } else {
        LOGGER.warn('withBuilder#addRail', 'No temporary rail available')
        return
      }

      // 仮レールを削除
      deleteTemporaryRail()
    })
    // 未接続の近傍ジョイントを接続する
    // TODO: ここもRunInActionに入れられないか調べる
    this.connectUnconnectedCloseJoints()
  }


  private addRailGroup = (railGroup: RailGroupData, children: RailData[]) => {
    const tmpRGC = getTemporaryRailGroupComponent()
    LOGGER.info('withBuilder#addRailGroup', 'temporaryRailGroup', tmpRGC)
    const railDatas = children.map(child => {
      const position = getRailComponent(child.id).railPart.getGlobalJointPosition(child.pivotJointIndex)
      const angle = child.angle + tmpRGC.getAngle()
      LOGGER.info('withBuilder#addRailGroup', children, position, angle)
      return {
        ...child,
        position,
        angle,
        pivotJointIndex: child.pivotJointIndex
      } as RailData
    })
    railDatas.forEach(railData => this.addSingleRail(railData))
  }

  private addSingleRail = (rail: RailData) => {
    const data = {
      ..._.omitBy(rail, _.isFunction),
      name: this.builderStore.paletteItem.name,
      layerId: this.layerPaletteStore.activeLayerId,  // 現在のレイヤーに置く
      enableJoints: true,                         // ジョイントを有効化
      opposingJoints: {},                         // 近傍ジョイントは後で接続する
      // opacity: 1,    // Layerの設定に従う
      // visible: true, // 同上
    }
    this.layoutStore.addRail(data)
  }

  private setCloseJointsDetecting = () => {
    this.changeJointState(this.layoutStore.unconnectedCloseJoints, DetectionState.DETECTING)
  }

  private changeJointState = (pairs: JointPair[], state: DetectionState, isError = false) => {
    pairs.forEach(pair => {
      // LOGGER.info(`change joint state`, pair) //`
      const rail = getRailComponent(pair.to.railId)
      const part = rail.joints[pair.to.jointId].part
      if (part.state.detectionState !== state) {
        part.setState({
          detectionState: state,
          detectionPartVisible: true,
          isError: isError,
        })
      }
    })
  }

  /**
   * レールを削除する。接続されているフィーダー、ギャップジョイナーも削除する。
   */
  @action
  deleteRail = (railId: number) => {
    // フィーダーを削除
    this.layoutStore.currentLayoutData.feeders
      .filter(feeder => feeder.railId === railId)
      .forEach(feeder => this.feederUseCase.deleteFeeder(feeder.id))
    // ジョイントを解除
    this.disconnectJoint(railId)
    // Switcherに接続されていたら削除
    this.switcherUseCase.disconnectTurnoutFromSwitcher(railId)
    this.layoutStore.deleteRail({id: railId})
  }

  @action
  deleteRails = (railIds: number[]) => {
    railIds.forEach(id => this.deleteRail(id))
  }

  @action
  checkIntersections() {
    const {temporaryRails} = this.builderStore
    const {currentLayoutData, activeLayerRails} = this.layoutStore

    const jointsCloseToTempRail = _.flatMap(temporaryRails, r => getCloseJointsOf(r.id, currentLayoutData.rails))
    // const closeJointPairForTempRail = this.props.layout.unconnectedCloseJoints.filter(ji => ji.from.railId === -1)
    const targetRailIds = _.without(activeLayerRails.map(rail => rail.id), ...jointsCloseToTempRail.map(j => j.to.railId))
    const intersects = temporaryRails.map(r => intersectsOf(r.id, targetRailIds)).some(e => e)
    this.builderStore.setIntersects(intersects)
  }

  @action
  connectJoint = (pair: JointPair) => {
    this.layoutStore.updateRail({
      id: pair.from.railId,
      opposingJoints: {
        [pair.from.jointId]: pair.to
      }
    })
    this.layoutStore.updateRail({
      id: pair.to.railId,
      opposingJoints: {
        [pair.to.jointId]: pair.from
      }
    })
  }

  /**
   * 複数のジョイントを接続する。
   */
  @action
  connectJoints = (pairs: JointPair[]) => {
    pairs.forEach(pair => this.connectJoint(pair))
  }

  @action
  connectUnconnectedCloseJoints = () => {
    this.connectJoints(this.layoutStore.unconnectedCloseJoints)
  }

  /**
   * 指定のレールのジョイントの接続を解除する。
   */
  @action
  disconnectJoint = (railId: number) => {
    const target = this.layoutStore.getRailDataById(railId)
    if (target == null) {
      return
    }

    // ギャップジョイナーを削除
    this.gapJoinerUseCase.disconnectGapJoiner(railId)

    // 指定のレールに接続されている全てのレールのジョイントを開放
    const updatedData = _.values(target.opposingJoints).map(joint => {
      return {
        id: joint.railId,
        opposingJoints: {
          [joint.jointId]: null
        }
      }
    })

    // 指定のレールのジョイントを全て開放
    updatedData.push({
      id: railId,
      opposingJoints: null
    })

    this.layoutStore.updateRails(updatedData)
  }

  @action
  disconnectJoints = (railIds: number[]) => {
    railIds.forEach(id => this.disconnectJoint(id))
  }

  @action
  deleteSelectedRails = () => {
    this.deleteRails(this.layoutStore.selectedRails.map(rail => rail.id))
  }

  @action
  deleteSelected = () => {
    switch (this.builderStore.activeTool) {
      case Tools.FEEDERS:
        this.feederUseCase.deleteSelectedFeeders()
        break
      case Tools.GAP_JOINERS:
        this.gapJoinerUseCase.deleteSelectedGapJoiners()
        break
      default:
        this.deleteSelectedRails()
        break
    }
  }

  /**
   * 選択中のレールを新しいレールグループとして登録する
   * @param {string} name
   */
  @action
  registerRailGroup = (name: string) => {
    const rails = this.layoutStore.selectedRails
    if (rails.length === 0) {
      this.uiStore.setCommonSnackbar(true, I18n.get(NO_RAIL_FOR_GROUP), 'warning')
      return
    }
    this.registerRailGroupInner(rails, name)
    this.uiStore.setCommonSnackbar(true, I18n.get(NEW_RAIL_GROUP)(rails.length, name), 'success')
  }

  private registerRailGroupInner = (rails: RailData[], name: string) => {
    // このレールグループメンバーのレールID
    const memberRailIds = rails.map(r => r.id)
    const openJoints = []
    rails.forEach((rail, idx) => {
      // 他のメンバーに接続されているジョイントだけをリストアップする
      const opposingJointIds = _.toPairs(rail.opposingJoints as OpposingJoints)
        .filter(([k, v]) => memberRailIds.includes(v.railId))
        .map(([k, v]) => Number(k))
      // このレールのジョイント数を取得し、未接続ジョイントのIDをリストアップする
      const numJoints = getRailComponent(rail.id).props.numJoints
      const openJointIds = _.without(_.range(numJoints), ...opposingJointIds)
      openJointIds.forEach(id => openJoints.push({railId: idx, jointId: id}))
    })
    // レールグループメンバー
    let newRails = rails.map((rail, idx) => {
      return {
        ..._.omitBy(rail, _.isFunction),
        id: -2 - idx,           // 仮のレールIDを割り当て
        enableJoints: false,    // ジョイント無効
        selected: false,        // 選択状態を解除
        railGroup: -1           // 仮のレールグループIDを割り当て
      }
    })

    // レールグループデータ
    const railGroup: UserRailGroupData = {
      type: 'RailGroup',
      rails: newRails,
      id: 0,
      name: name,
      position: {x: 0, y: 0},
      angle: 0,
      openJoints: openJoints
    }

    LOGGER.info('withBuilder#registerRailGroupInner', railGroup)
    this.builderStore.addUserRailGroup(railGroup)
  }
}