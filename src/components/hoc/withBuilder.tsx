import * as React from 'react'
import {connect} from 'react-redux';
import {PaletteItem, RootState} from "store/type";
import {LayoutData, RailGroupDataPayload} from "reducers/layout";
import {currentLayoutData, isLayoutEmpty, nextRailGroupId, nextRailId} from "selectors";
import {Point, ToolEvent} from "paper";
import {addUserRailGroup, deleteTemporaryRail, setTemporaryRail, setTemporaryRailGroup} from "actions/builder";
import {UserRailGroupData} from "reducers/builder";
import getLogger from "logging";
import update from "immutability-helper";
import {RailData, RailGroupData} from "components/rails";
import {addHistory, addRail, addRailGroup, removeRail, updateRail} from "actions/layout";
import {JointInfo} from "components/rails/RailBase";
import {getAllRailComponents, getRailComponent} from "components/rails/utils";
import RailGroup from "components/rails/RailGroup/RailGroup";
import {DetectionState} from "components/rails/parts/primitives/DetectablePart";
import NewRailGroupDialog from "components/hoc/NewRailGroupDialog/NewRailGroupDialog";
import railItems from "constants/railItems.json"
import {TEMPORARY_RAIL_OPACITY} from "constants/tools";
import {inject, observer} from "mobx-react";


const LOGGER = getLogger(__filename)


export interface WithBuilderPublicProps {
  builderMouseDown: (e: ToolEvent|any) => void
  builderMouseMove: (e: ToolEvent|any) => void
  builderKeyDown: (e: ToolEvent|any) => void
  builderConnectJoints: (pairs: JointPair[]) => void
  builderDisconnectJoint: (railId: number) => void
  builderChangeJointState: (pairs: JointPair[], state: DetectionState, isError?: boolean) => void
  builderSelectRail: (railId: number) => void
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
  layout: LayoutData
  paletteItem: PaletteItem
  activeLayerId: number
  isLayoutEmpty: boolean
  setTemporaryRail: (item: RailData) => void
  deleteTemporaryRail: () => void
  nextRailId: number
  nextRailGroupId: number
  temporaryRails: RailData[]
  temporaryRailGroup: RailGroupData
  addRail: (item: RailData, overwrite?: boolean) => void
  updateRail: (item: Partial<RailData>, overwrite?: boolean) => void
  removeRail: (item: RailData, overwrite?: boolean) => void
  addHistory: () => void
  addUserRailGroup: (railGroup: UserRailGroupData) => void
  userRailGroups: UserRailGroupData[]
  userCustomRails: any[]
  setTemporaryRailGroup: (item: RailGroupDataPayload) => void
  addRailGroup: (item: RailGroupData, children: RailData[], overwrite?: boolean) => void
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

  const mapStateToProps = (state: RootState) => {
    return {
      layout: currentLayoutData(state),
      paletteItem: state.builder.paletteItem,
      activeLayerId: state.builder.activeLayerId,
      isLayoutEmpty: isLayoutEmpty(state),
      temporaryRails: state.builder.temporaryRails,
      temporaryRailGroup: state.builder.temporaryRailGroup,
      nextRailId: nextRailId(state),
      nextRailGroupId: nextRailGroupId(state),
      userRailGroups: state.builder.userRailGroups,
      userCustomRails: state.builder.userCustomRails,
    }
  }

  const mapDispatchToProps = (dispatch: any) => {
    return {
      setTemporaryRail: (item: RailData) => dispatch(setTemporaryRail(item)),
      deleteTemporaryRail: () => dispatch(deleteTemporaryRail({})),
      addRail: (item: RailData, overwrite = false) => dispatch(addRail({item, overwrite})),
      updateRail: (item: Partial<RailData>, overwrite = false) => dispatch(updateRail({item, overwrite})),
      removeRail: (item: RailData, overwrite = false) => dispatch(removeRail({item, overwrite})),
      addHistory: () => dispatch(addHistory({})),
      addUserRailGroup: (railGroup: UserRailGroupData) => dispatch(addUserRailGroup(railGroup)),
      setTemporaryRailGroup: (item: RailGroupDataPayload) => dispatch(setTemporaryRailGroup(item)),
      addRailGroup: (item: RailGroupData, children: RailData[], overwrite?: boolean) => dispatch(addRailGroup({
        item,
        children,
        overwrite
      }))
    }
  }

  @inject('builder', 'layout')
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
        name = this.props.paletteItem.name
      }
      const presetItem = railItems.items.find(item => item.name === name)
      if (presetItem) {
        return presetItem
      }
      const customRail = this.props.userCustomRails.find(item => item.name === name)
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
        name = this.props.paletteItem.name
        if (this.props.paletteItem.type !== 'RailGroup') {
          return null
        }
      }
      return this.props.userRailGroups.find(rg => rg.name === name)
    }

    /**
     * 仮レールを設置する。
     * @param {RailData} railData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
     */
    setTemporaryRail = (railData: RailData) => {
      // 仮レールを設置する
      this.props.setTemporaryRail({
        ...railData,
        id: -1,
        name: 'TemporaryRail',
        layerId: -1,
        enableJoints: false,
        opacity: TEMPORARY_RAIL_OPACITY,
        visible: true,
      })
    }

    /**
     * 仮レールの位置にレールまたはレールグループを設置する。
     * @param {RailData} railData
     */
    addRail = () => {
      if (this.props.temporaryRailGroup) {
        // レールグループを追加
        const children = this.props.temporaryRails.map((temporaryRail, idx) => {
          return {
            ...temporaryRail,
            id: this.props.nextRailId + idx,    // IDを新規に割り振る
            name: '',
            layerId: this.props.activeLayerId,  // 現在のレイヤーに置く
            opacity: 1,
            opposingJoints: {},
            enableJoints: true,                 // ジョイントを有効化する
          }
        })
        this.props.addRailGroup({
          ...this.props.temporaryRailGroup,
          id: this.props.nextRailGroupId,       // IDを新規に割り振る
          name: '',
        }, children)
      } else {
        // 単体のレールを追加
        const temporaryRail = this.props.temporaryRails[0]
        this.props.addRail({
          ...temporaryRail,
          id: this.props.nextRailId,
          layerId: this.props.activeLayerId,
          enableJoints: true,
          opposingJoints: {},
          opacity: 1,
          visible: true,
        })
      }

      // 仮レールを削除
      this.props.deleteTemporaryRail()
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
          layerId: this.props.activeLayerId,
          enableJoints: false,                  // ジョイント無効
          opacity: TEMPORARY_RAIL_OPACITY,
          visible: true,
        }
      })

      // 仮レールグループを設置する
      this.props.setTemporaryRailGroup({
        item: railGroup,
        children: children
      })
      LOGGER.info('TemporaryRailGroup', railGroup, children)
    }


    /**
     * 選択中のレールを削除する。
     */
    removeSelectedRails() {
      const selectedRails = this.props.layout.rails.filter(r => r.selected)
      LOGGER.info(`[Builder] Selected rail IDs: ${selectedRails.map(r => r.id)}`); // `

      selectedRails.forEach(item => {
        this.props.addHistory()
        this.disconnectJoint(item.id)
        this.props.removeRail(item, true)
      })
    }


    getSelectedRailData() {
      return getAllRailComponents()
        .filter(rail => rail.props.selected)
        .map(rail => rail.props)
    }


    /**
     * 指定のレールのジョイント接続を解除する。
     */
    disconnectJoint = (railId: number) => {
      const targetRail = this.props.layout.rails.find(r => r.id === railId)
      if (targetRail == null) {
        return
      }
      // 指定のレールに接続されている全てのレールのジョイントを解除する
      const connectedJoints = targetRail.opposingJoints
      _.values(connectedJoints).forEach((joint: JointInfo) => {
        this.props.updateRail({
          id: joint.railId,
          opposingJoints: {
            [joint.jointId]: null
          }
        }, true)
      })
      // 指定のレールのジョイントを解除する
      this.props.updateRail({
        id: railId,
        opposingJoints: null
      }, true)
    }

    /**
     * レール同士のジョイントを接続する。
     * 複数指定可能。特に同一レールの複数ジョイントを接続する場合は一度の呼び出しで実行すること
     */
    connectJoints = (pairs: JointPair[]) => {
      pairs.forEach(pair => {
        LOGGER.info(`connect Joints`, pair) //`
        this.props.updateRail({
          id: pair.from.railId,
          opposingJoints: {
            [pair.from.jointId]: pair.to
          }
        }, true)
        this.props.updateRail({
          id: pair.to.railId,
          opposingJoints: {
            [pair.to.jointId]: pair.from
          }
        }, true)
      })
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


    /**
     * レールを選択する。
     */
    selectRail = (railId: number) => {
      const railData = this.getRailDataById(railId)
      if (railData) {
        this.props.updateRail(update(railData, {
            selected: {$set: true}
          }
        ), true)
      }
    }

    /**
     * レールを選択する。
     * @param {RailData} railData
     */
    toggleRail = (railData: RailData) => {
      this.props.updateRail(update(railData, {
          selected: {$set: ! railData.selected}
        }
      ), true)
    }

    /**
     * レールの選択を解除する。
     * @param {RailData} railData
     */
    deselectRail = (railData: RailData) => {
      this.props.updateRail(update(railData, {
          selected: {$set: false}
        }
      ), true)
    }

    /**
     * 全てのレールの選択を解除する。
     */
    deselectAllRails = () => {
      this.props.layout.rails.filter(r => r.selected).forEach(railData => {
        this.props.updateRail(update(railData, {
            selected: {$set: false}
          }
        ), true)
      })
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
        id: this.props.nextRailGroupId,
        name: name,
        position: new Point(0, 0),
        angle: 0,
        openJoints: openJoints
      }
      this.props.addUserRailGroup(railGroup)
    }

    private getRailDataById = (id: number) => {
      return this.props.layout.rails.find(item => item.id === id)
    }

    private getSelectedRails = () => {
      return this.props.layout.rails.filter(r => r.selected)
    }
  }

  // return connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(WithBuilder)
  return WithBuilder
}


