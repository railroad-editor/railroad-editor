import * as React from 'react'
import {Point, ToolEvent} from "paper";
import getLogger from "logging";
import update from "immutability-helper";
import {RailData, RailGroupData} from "components/rails";
import {JointInfo} from "components/rails/RailBase";
import {getAllRailComponents, getCloseJointsOf, getRailComponent, intersectsOf} from "components/rails/utils";
import RailGroup from "components/rails/RailGroup/RailGroup";
import {DetectionState} from "components/rails/parts/primitives/DetectablePart";
import NewRailGroupDialog from "components/hoc/NewRailGroupDialog/NewRailGroupDialog";
import railItems from "constants/railItems.json"
import {TEMPORARY_RAIL_OPACITY} from "constants/tools";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT} from 'constants/stores';
import {BuilderStore, UserRailGroupData} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";


const LOGGER = getLogger(__filename)


export interface WithBuilderPublicProps {
  builderMouseDown: (e: ToolEvent|any) => void
  builderMouseMove: (e: ToolEvent|any) => void
  builderKeyDown: (e: ToolEvent|any) => void
  builderConnectJoints: (pairs: JointPair[]) => void
  builderDisconnectJoint: (railId: number) => void
  builderChangeJointState: (pairs: JointPair[], state: DetectionState, isError?: boolean) => void
  builderSelectRail: (railId: number) => void
  builderSelectRails: (railIds: number[]) => void
  builderDeselectRail: (railData: RailData) => void
  builderToggleRail: (railData: RailData) => void
  builderDeselectAllRails: () => void
  builderRemoveSelectedRails: () => void
  builderGetRailItemData: (name?: string) => any
  builderGetUserRailGroupData: (name?: string) => UserRailGroupData
  builderSetTemporaryRail: (railData: Partial<RailData>) => void
  builderAddRail: () => void
  builderSetTemporaryRailGroup: (railGroupData: Partial<RailGroupData>, childRails: RailData[]) => void
}



interface WithBuilderPrivateProps {
  builder?: BuilderStore
  layout?: LayoutStore
}

export type WithBuilderProps = WithBuilderPublicProps & WithBuilderPrivateProps


export interface JointPair {
  from: JointInfo
  to: JointInfo
}


export interface WithBuilderState {
  newRailGroupDialogOpen: boolean
}


/**
 * レールの設置に関連する機能を提供するHOC。
 * 依存: WithHistory
 */
export default function withBuilder(WrappedComponent: React.ComponentClass<WithBuilderPublicProps>) {


  @inject(STORE_BUILDER, STORE_LAYOUT)
  @observer
  class WithBuilder extends React.Component<WithBuilderProps, WithBuilderState> {

    constructor(props: WithBuilderProps) {
      super(props)

      this.state = {
        newRailGroupDialogOpen: false
      }

      this.mouseDown = this.mouseDown.bind(this)
      this.mouseLeftDown = this.mouseLeftDown.bind(this)
      this.mouseRightDown = this.mouseRightDown.bind(this)
      this.mouseMove = this.mouseMove.bind(this)
      this.keyDown = this.keyDown.bind(this)
      this.connectJoints = this.connectJoints.bind(this)
      this.disconnectJoint = this.disconnectJoint.bind(this)
      this.selectRail = this.selectRail.bind(this)
      this.deselectRail = this.deselectRail.bind(this)
      this.toggleRail = this.toggleRail.bind(this)
      this.removeSelectedRails = this.removeSelectedRails.bind(this)
      this.getRailItemData = this.getRailItemData.bind(this)
    }

    // componentDidMount() {
    //   document.addEventListener('keydown', this.keyDown)
    // }
    //
    // componentWillUnmount() {
    //   document.removeEventListener('keydown', this.keyDown)
    // }

    mouseMove = (e: ToolEvent | any) => {
      // noop
    }

    mouseDown(e: ToolEvent | any) {
      switch (e.event.button) {
        case 0:
          this.mouseLeftDown(e)
          break
        case 2:
          this.mouseRightDown(e)
          break
      }
    }

    mouseLeftDown(e: ToolEvent | any) {
      // noop
    }

    mouseRightDown(e: ToolEvent | any) {
      // noop
    }


    keyDown(e: ToolEvent | any) {
      let methodName= 'keyDown_'
      if (e.modifiers.control) {
        methodName = methodName.concat('Ctrl')
      }
      if (e.modifiers.alt) {
        methodName = methodName.concat('Alt')
      }
      if (e.modifiers.shift) {
        methodName = methodName.concat('Shift')
      }
      methodName = methodName.concat(_.startCase(e.key))

      LOGGER.debug(methodName)
      if (this[methodName]) {
        this[methodName](e)
      }
    }

    keyDown_Backspace = (e) => {
      this.removeSelectedRails()
    }

    keyDown_CtrlC = (e) => {
      const selectedRails = this.getSelectedRails()
      if (selectedRails.length > 0) {
        this.setState({
          newRailGroupDialogOpen: true
        })
      }
    }

    keyDown_CtrlX = (e) => {
      // this.keyDown_CtrlC(e)
    }

    /**
     * 指定の名前のレールの固有Propsを返す。
     * プリセットのレールに無ければユーザーカスタムレールで探して返す。
     * @param {string} name
     * @returns {any}
     */
    getRailItemData = (name?: string) => {
      if (! name) {
        name = this.props.builder.paletteItem.name
      }
      const presetItem = railItems.items.find(item => item.name === name)
      if (presetItem) {
        return presetItem
      }
      const customRail = this.props.builder.userRails.find(item => item.name === name)
      if (customRail) {
        return customRail
      }
      return null
    }

    /**
     * 指定の名前のユーザー登録済みレールグループデータを返す。
     * @param {string} name
     * @returns {any}
     */
    getUserRailGroupData = (name?: string) => {
      if (! name) {
        name = this.props.builder.paletteItem.name
        if (this.props.builder.paletteItem.type !== 'RailGroup') {
          return null
        }
      }
      return this.props.builder.userRailGroups.find(rg => rg.name === name)
    }

    /**
     * 仮レールを設置する。
     * @param {RailData} railData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
     */
    setTemporaryRail = (railData: RailData) => {
      // 仮レールを設置する
      this.props.builder.setTemporaryRail({
        ...railData,
        id: -1,
        name: 'TemporaryRail',
        layerId: -1,
        enableJoints: false,
        opacity: TEMPORARY_RAIL_OPACITY,
        visible: true,
      })
      // 近傍ジョイントを検出状態に変更する
      this.setCloseJointsDetecting()
      // 重なりをチェックする
      this.checkIntersections()
    }

    connectCloseJoints = () => {
      this.connectJoints(this.props.layout.unconnectedCloseJoints)
    }

    setCloseJointsDetecting = () => {
      this.changeJointState(this.props.layout.unconnectedCloseJoints, DetectionState.DETECTING)
    }

    checkIntersections = () => {
      const {temporaryRails} = this.props.builder;
      const {currentLayoutData, activeLayerRails} = this.props.layout;

      const jointsCloseToTempRail = _.flatMap(temporaryRails, r => getCloseJointsOf(r.id, currentLayoutData.rails))
      // const closeJointPairForTempRail = this.props.layout.unconnectedCloseJoints.filter(ji => ji.from.railId === -1)
      const targetRailIds = _.without(activeLayerRails.map(rail => rail.id), ...jointsCloseToTempRail.map(j => j.to.railId))
      const intersects = temporaryRails.map(r => intersectsOf(r.id, targetRailIds)).some(e => e)
      LOGGER.info("Temporary rail's close joints", jointsCloseToTempRail)

      this.props.builder.setIntersects(intersects)
      // LOGGER.info('Intersection detected')
    }


    /**
     * 仮レールの位置にレールまたはレールグループを設置する。
     */
    addRail = () => {
      const {temporaryRails, temporaryRailGroup, activeLayerId, deleteTemporaryRail} = this.props.builder
      const {nextRailId, nextRailGroupId, addRail, addRailGroup} = this.props.layout

      this.props.layout.commit()

      if (temporaryRailGroup) {
        // レールグループを追加
        const children = temporaryRails.map((temporaryRail, idx) => {
          LOGGER.debug(_.keys(temporaryRail))
          LOGGER.debug(_.pickBy(temporaryRail, p => ! _.isFunction(p)))
          return {
            ...temporaryRail,
            id: nextRailId + idx,    // IDを新規に割り振る
            name: '',
            layerId: activeLayerId,  // 現在のレイヤーに置く
            opacity: 1,
            opposingJoints: {},
            enableJoints: true,                 // ジョイントを有効化する
          }
        })
        addRailGroup({
          ...temporaryRailGroup,
          id: nextRailGroupId,       // IDを新規に割り振る
          name: '',
        }, children)
      } else {
        // 単体のレールを追加
        const temporaryRail = temporaryRails[0]
        addRail({
          ...temporaryRail,
          id: nextRailId,
          layerId: activeLayerId,
          enableJoints: true,
          opposingJoints: {},
          opacity: 1,
          visible: true,
        })
      }

      // 仮レールを削除
      deleteTemporaryRail()
      this.connectCloseJoints()
    }

    /**
     * 仮レールグループを設置する。
     * @param {RailGroupData} railGroupData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
     * @param {RailData[]} childRails
     */
    setTemporaryRailGroup = (railGroupData: RailGroupData, childRails: RailData[]) => {
      // レールグループデータの作成
      const railGroup: RailGroupData = {
        ...railGroupData,
        type: 'RailGroup',
        id: -1,
        name: 'TemporaryRailGroup',
        rails: []
      }

      // レールグループに所属するレールデータの作成
      const children = childRails.map((r, idx) => {
        return {
          ...r,
          id: -2 - idx,
          name: 'TemporaryRail',
          layerId: this.props.builder.activeLayerId,
          enableJoints: false,                  // ジョイント無効
          opacity: TEMPORARY_RAIL_OPACITY,
          visible: true,
        }
      })

      // 仮レールグループを設置する
      this.props.builder.setTemporaryRailGroup(railGroup, children)
      LOGGER.info('TemporaryRailGroup', railGroup, children)
      this.setCloseJointsDetecting()
      this.checkIntersections()
    }


    /**
     * 選択中のレールを削除する。
     */
    removeSelectedRails() {
      const selectedRails = this.props.layout.currentLayoutData.rails.filter(r => r.selected)
      LOGGER.info(`[Builder] Selected rail IDs: ${selectedRails.map(r => r.id)}`); // `

      selectedRails.forEach(item => {
        this.disconnectJoint(item.id)
        this.props.layout.deleteRail(item)
      })
      this.props.layout.commit()
    }


    getSelectedRailData() {
      return getAllRailComponents()
        .filter(rail => rail.props.selected)
        .map(rail => rail.props)
    }


    /**
     * 指定のレールの全てのジョイント接続を解除する。
     */
    disconnectJoint = (railId: number) => {
      const target = this.getRailDataById(railId)
      if (target == null) {
        return
      }
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

      this.props.layout.updateRails(updatedData)
    }

    /**
     * ジョイントを接続する。
     */
    connectJoints = (pairs: JointPair[]) => {
      const target =_.flatMap(pairs, pair => {
        return [
          {
            id: pair.from.railId,
            opposingJoints: {
              [pair.from.jointId]: pair.to
            }
          },
          {
            id: pair.to.railId,
            opposingJoints: {
              [pair.to.jointId]: pair.from
            }
          }
        ]
      })

      this.props.layout.updateRails(target)
    }


    changeJointState = (pairs: JointPair[], state: DetectionState, isError = false) => {
      pairs.forEach(pair => {
        LOGGER.info(`change joint state`, pair) //`
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

    selectRails = (railIds: number[]) => {
      const updated = railIds.map(r => {
          const railData = this.getRailDataById(r)
          return {
            id: railData.id,
            selected: true
          }
        }
      )
      this.props.layout.updateRails(updated)
    }

    /**
     * レールを選択する。
     */
    selectRail = (railId: number) => {
      const railData = this.getRailDataById(railId)
      if (! railData) return

      this.props.layout.updateRail({
        id: railData.id,
        selected: true
      })
    }

    /**
     * レールを選択する。
     * @param {RailData} railData
     */
    toggleRail = (railData: RailData) => {
      this.props.layout.updateRail({
        id: railData.id,
        selected: ! railData.selected,
      })
    }

    /**
     * レールの選択を解除する。
     * @param {RailData} railData
     */
    deselectRail = (railData: RailData) => {
      this.props.layout.updateRail({
        id: railData.id,
        selected: false
      })
    }

    /**
     * 全てのレールの選択を解除する。
     */
    deselectAllRails = () => {
      const selected = this.props.layout.currentLayoutData.rails.filter(r => r.selected)
      this.props.layout.updateRails(selected.map(r => {
        return {
          id: r.id,
          selected: false
        }
      }))
    }

    render() {
      // PrivateなPropsは下位に渡さない
      // TODO: ts-transformer-keys で型情報を使ってオミットする
      const props = _.omit(this.props,
        'layout',
        'paletteItem',
        'activeLayerId',
        'isLayoutEmpty',
        'setTemporaryRail',
        'deleteTemporaryRail',
        'nextRailId',
        'nextRailGroupId',
        'temporaryRails',
        'addRail',
        'updateRail',
        'removeRail',
        'addHistory',
        'addUserRailGroup',
      )


      return (
        <React.Fragment>
          <WrappedComponent
            {...props}
            builderMouseDown={this.mouseDown}
            builderMouseMove={this.mouseMove}
            builderKeyDown={this.keyDown}
            builderGetRailItemData={this.getRailItemData}
            builderGetUserRailGroupData={this.getUserRailGroupData}
            builderSetTemporaryRail={this.setTemporaryRail}
            builderSetTemporaryRailGroup={this.setTemporaryRailGroup}
            builderAddRail={this.addRail}
            builderConnectJoints={this.connectJoints}
            builderDisconnectJoint={this.disconnectJoint}
            builderChangeJointState={this.changeJointState}
            builderSelectRail={this.selectRail}
            builderSelectRails={this.selectRails}
            builderDeselectRail={this.deselectRail}
            builderToggleRail={this.toggleRail}
            builderDeselectAllRails={this.deselectAllRails}
            builderRemoveSelectedRails={this.removeSelectedRails}
          />
          <NewRailGroupDialog
            title={'New Rail Group'}
            open={this.state.newRailGroupDialogOpen}
            onClose={this.onNewRailGroupDialogClose}
            onOK={this.onNewRailGroupDialogOK}
          />
        </React.Fragment>
      )
    }


    private onNewRailGroupDialogClose = () => {
      this.setState({
        newRailGroupDialogOpen: false
      })
    }

    private onNewRailGroupDialogOK = (name: string) => {
      this.registerRailGroup(name)
      this.deselectAllRails()
    }

    /**
     * 選択中のレールを新しいレールグループとして登録する
     */
    private registerRailGroup = (name: string) => {
      // 選択中のレールコンポーネントのPropsを取得する
      const selectedRails = this.getSelectedRailData()
      // 空いているジョイントを探す
      // レールグループ内のレール以外に繋がっているジョイントも空きジョイントとする
      const openJoints = []
      let newRails = selectedRails.map((rail, idx) => {
        const opposingJointIds = _.keys(rail.opposingJoints).map(k => parseInt(k))
        const openJointIds = _.without(_.range(rail.numJoints), ...opposingJointIds)
        openJointIds.forEach(id => openJoints.push({
          railId: idx,
          jointId: id
        }))
        return update(rail, {
          id: {$set: -2-idx},           // 仮のIDを割り当てる
          enableJoints: {$set: false},  // ジョイントは無効にしておく
          selected: {$set: false},      // 選択状態は解除しておく
          railGroup: {$set: -1},        // 仮のレールグループIDを割り当てる
        })
      })

      // レールグループデータを生成する
      const railGroup: UserRailGroupData = {
        type: 'RailGroup',
        rails: newRails,
        id: this.props.layout.nextRailGroupId,
        name: name,
        position: new Point(0, 0),
        angle: 0,
        openJoints: openJoints
      }
      this.props.builder.addUserRailGroup(railGroup)
    }

    private getRailDataById = (id: number) => {
      return this.props.layout.currentLayoutData.rails.find(item => item.id === id)
    }

    private getSelectedRails = () => {
      return this.props.layout.currentLayoutData.rails.filter(r => r.selected)
    }
  }

  // return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(WithBuilder)
  return WithBuilder
}


