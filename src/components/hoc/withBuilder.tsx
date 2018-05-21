import * as React from 'react'
import {Point, ToolEvent} from "paper";
import getLogger from "logging";
import {RailData, RailGroupData} from "components/rails";
import {JointInfo} from "components/rails/RailBase";
import {getCloseJointsOf, getRailComponent, getTemporaryRailGroupComponent, intersectsOf} from "components/rails/utils";
import RailGroup from "components/rails/RailGroup/RailGroup";
import {DetectionState} from "components/rails/parts/primitives/DetectablePart";
import railItems from "constants/railItems.json"
import {TEMPORARY_RAIL_OPACITY, Tools} from "constants/tools";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_UI} from 'constants/stores';
import {BuilderStore, UserRailGroupData} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import * as $ from "jquery";
import {compose} from "recompose";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {UiStore} from "store/uiStore";
import {LayoutLogicStore} from "store/layoutLogicStore";


const LOGGER = getLogger(__filename)


export interface WithBuilderPublicProps {
  builderMouseDown: (e: ToolEvent|any) => void
  builderMouseMove: (e: ToolEvent|any) => void
  builderKeyDown: (e: ToolEvent|any) => void
  builderKeyUp: (e: ToolEvent|any) => void
  builderConnectJoints: (pairs: JointPair[]) => void
  builderDisconnectJoint: (railId: number) => void
  builderChangeJointState: (pairs: JointPair[], state: DetectionState, isError?: boolean) => void
  builderSelectRail: (railId: number) => void
  builderSelectRails: (railIds: number[]) => void
  builderDeselectRail: (railData: RailData) => void
  builderToggleRail: (railData: RailData, deselectOthers: boolean) => void
  builderDeselectAllRails: () => void
  builderDeleteSelectedRails: () => void
  builderGetRailItemData: (name?: string) => any
  builderGetRailGroupItemData: (name?: string) => UserRailGroupData
  builderSetTemporaryRail: (railData: Partial<RailData>) => void
  builderAddRail: () => void
  builderSetTemporaryRailGroup: (railGroupData: Partial<RailGroupData>, childRails: RailData[]) => void
  builderRegisterRailGroup: (name: string, shouldDelete: boolean) => void
  snackbar: any
}



interface WithBuilderPrivateProps {
  builder?: BuilderStore
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
  ui?: UiStore
}

export type WithBuilderProps = WithBuilderPublicProps & WithBuilderPrivateProps


export interface JointPair {
  from: JointInfo
  to: JointInfo
}


export interface WithBuilderState {
  newRailGroupDialogOpen: boolean
  deleteOnRegistered: boolean
}


/**
 * レールの設置に関連する機能を提供するHOC。
 * 依存: WithHistory
 */
export default function withBuilder(WrappedComponent: React.ComponentClass<WithBuilderPublicProps>) {

  @inject(STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC, STORE_UI)
  @observer
  class WithBuilder extends React.Component<WithBuilderProps, WithBuilderState> {

    _prevTool: Tools
    _prevPaletteItem: PaletteItem

    constructor(props: WithBuilderProps) {
      super(props)

      this.state = {
        newRailGroupDialogOpen: false,
        deleteOnRegistered: false,
      }

      this.mouseDown = this.mouseDown.bind(this)
      this.mouseLeftDown = this.mouseLeftDown.bind(this)
      this.mouseRightDown = this.mouseRightDown.bind(this)
      this.mouseMove = this.mouseMove.bind(this)
      this.keyDown = this.keyDown.bind(this)
      this.keyUp = this.keyUp.bind(this)
      this.connectJoints = this.connectJoints.bind(this)
      this.disconnectJoint = this.disconnectJoint.bind(this)
      this.selectRail = this.selectRail.bind(this)
      this.deselectRail = this.deselectRail.bind(this)
      this.toggleRail = this.toggleRail.bind(this)
      this.deleteSelectedRails = this.deleteSelectedRails.bind(this)
      this.getRailItemData = this.getRailItemData.bind(this)
    }


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

    keyUp = (e: ToolEvent | any) => {
      if (this.dialogExists()) return

      let methodName = 'keyUp_'
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

    keyDown = (e: ToolEvent | any) => {
      if (this.dialogExists()) return

      let methodName = 'keyDown_'
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
      this.deleteSelectedRails()
    }

    keyDown_CtrlC = (e) => {
      this.registerRailGroup('Clipboard', false)
      this.props.snackbar.showMessage('Copied rails to "Clipboard" rail group.')
    }

    keyDown_CtrlX = (e) => {
      this.registerRailGroup('Clipboard', true)
      this.props.snackbar.showMessage('Copied rails to "Clipboard" rail group.')
    }

    keyDown_CtrlV = (e) => {
      if (this.getUserRailGroupItemData('Clipboard')
        && this._prevTool == null && this._prevPaletteItem == null) {
        LOGGER.info('CTRL V Down')
        this._prevTool = this.props.builder.activeTool
        this._prevPaletteItem = this.props.builder.paletteItem
        this.props.builder.setActiveTool(Tools.RAIL_GROUPS)
        this.props.builder.setPaletteItem({type: 'RailGroup', name: 'Clipboard'})
      }
    }

    keyUp_CtrlV = (e) => {
      if (this.getUserRailGroupItemData('Clipboard')
        && this._prevTool != null && this._prevPaletteItem != null) {
        LOGGER.info('CTRL V Up')
        this.props.builder.setActiveTool(this._prevTool)
        this.props.builder.setPaletteItem(this._prevPaletteItem)
        this._prevTool = this._prevPaletteItem = null
      }
    }

    keyDown_CtrlA = (e) => {
      this.selectRails(this.props.layout.currentLayoutData.rails.map(rail => rail.id))
    }

    keyDown_CtrlO = (e) => {
      this.props.ui.setLayoutsDialog(true)
    }

    keyDown_CtrlN = (e) => {
      this.props.ui.setCreateNewDialog(true)
    }

    keyDown_CtrlS = (e) => {
      this.props.layout.saveLayout(this.props.snackbar.showMessage)
    }

    /**
     * 指定の名前のレールの固有Propsを返す。
     * プリセットのレールに無ければユーザーカスタムレールで探して返す。
     * @param {string} name
     * @returns {any}
     */
    getRailItemData = (name?: string) => {
      if (!name) {
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
    getUserRailGroupItemData = (name?: string) => {
      if (!name) {
        name = this.props.builder.paletteItem.name
        if (this.props.builder.paletteItem.type !== 'RailGroup') {
          return null
        }
      }
      const ret = this.props.builder.userRailGroups.find(rg => rg.name === name)
      LOGGER.debug('withBuilder#getUserRailGroupItemData', ret)
      return ret
    }

    /**
     * 仮レールを設置する。
     * @param {RailData} railData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
     */
    setTemporaryRail = (railData: RailData) => {
      // 仮レールデータ
      const tempRail = {
        ...railData,
        id: -1,                             // 仮のレールID
        name: 'TemporaryRail',              //
        layerId: -1,                        // 仮のレイヤーに設置
        enableJoints: false,                // ジョイントを無効化
        opacity: TEMPORARY_RAIL_OPACITY,    // 半透明
        visible: true,
      }
      // 仮レール設置
      this.props.builder.setTemporaryRail(tempRail)
      // 近傍ジョイントを検出状態に変更する
      this.setCloseJointsDetecting()
      // 重なりをチェックする
      const intersects = this.checkIntersections()
      LOGGER.info('withBuilder#setTemporaryRail', railData, 'intersects:', intersects)
    }

    /**
     * 仮レールグループを設置する。
     * @param {RailGroupData} railGroupData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
     * @param {RailData[]} childRails
     */
    setTemporaryRailGroup = (railGroupData: RailGroupData, childRails: RailData[]) => {
      // 仮レールグループメンバー
      const children = childRails.map((r, idx) => {
        return {
          ...r,
          id: -2 - idx,                       // 仮のレールIDを割り当て
          name: 'TemporaryRail',              //
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
        name: 'TemporaryRailGroup',               //
        rails: children.map(c => c.id)  // メンバーレール
      }

      // 仮レールグループ設置
      this.props.builder.setTemporaryRailGroup(railGroup, children)
      // 近傍ジョイントを検出状態に変更する
      this.setCloseJointsDetecting()
      // 重なりをチェックする
      const intersects = this.checkIntersections()
      LOGGER.info('withBuilder#setTemporaryRailGroup', railGroup, children, 'intersects:', intersects)
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
      return intersects
    }


    /**
     * 仮レールの位置にレールまたはレールグループを設置する。
     */
    public addRail = () => {
      const {temporaryRails, temporaryRailGroup, deleteTemporaryRail} = this.props.builder

      this.props.layout.commit()

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
      // 未接続の近傍ジョイントを接続する
      this.connectCloseJoints()
    }

    /**
     * 単体のレールを設置する。
     * @param {RailData} rail
     */
    private addSingleRail = (rail: RailData) => {
      const data = {
        ..._.omitBy(rail, _.isFunction),
        name: '',
        layerId: this.props.builder.activeLayerId,  // 現在のレイヤーに置く
        enableJoints: true,                         // ジョイントを有効化
        opposingJoints: {},                         // 近傍ジョイントは後で接続する
        // opacity: 1,    // Layerの設定に従う
        // visible: true, // 同上
      }
      this.props.layout.addRail(data)
    }

    private addSingleRails = (rails: RailData[]) => {
      const railDatas = rails.map(rail => {
        return {
          ..._.omitBy(rail, _.isFunction),
          name: '',
          layerId: this.props.builder.activeLayerId,  // 現在のレイヤーに置く
          enableJoints: true,                         // ジョイントを有効化
          opposingJoints: {},                         // 近傍ジョイントは後で接続する
          // opacity: 1,    // Layerの設定に従う
          // visible: true, // 同上
        }
      })
      this.props.layout.addRails(railDatas)
    }

    /**
     * レールグループを複数のレールとして追加する。
     * @param {RailGroupData} railGroup
     * @param {RailData[]} children
     */
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
      this.addSingleRails(railDatas)
    }

    // /**
    //  * レールグループを設置する。
    //  * @param {RailGroupData} railGroup
    //  * @param {RailData[]} children
    //  */
    // private addRailGroup = (railGroup: RailGroupData, children: RailData[]) => {
    //   const newChildren = children.map((temporaryRail, idx) => {
    //     return {
    //       ..._.omit(temporaryRail, p => _.isFunction(p)),
    //       // id: nextRailId + idx,    // 仮のレールIDを割り振る
    //       name: '',
    //       layerId: this.props.builder.activeLayerId,  // 現在のレイヤーに置く
    //       enableJoints: true,                         // ジョイントを有効化
    //       opposingJoints: {},                         // 近傍ジョイントは後で接続する
    //       opacity: 1,
    //       visible: true,
    //     }
    //   })
    //   // レールグループを追加
    //   this.props.layout.addRailGroup({ ...railGroup, name: '' }, newChildren)
    // }


    /**
     * 選択中のレールを削除する。
     */
    deleteSelectedRails() {
      // いったんセーブ
      this.props.layout.commit()
      this.props.layoutLogic.deleteSelectedRails()
    }


    /**
     * 指定のレールの全てのジョイント接続を解除する。
     */
    disconnectJoint = (railId: number) => {
      this.props.layoutLogic.disconnectJoint(railId)
      // const target = this.getRailDataById(railId)
      // if (target == null) {
      //   return
      // }
      // // 指定のレールに接続されている全てのレールのジョイントを開放
      // const updatedData = _.values(target.opposingJoints).map(joint => {
      //   return {
      //     id: joint.railId,
      //     opposingJoints: {
      //       [joint.jointId]: null
      //     }
      //   }
      // })
      //
      // // 指定のレールのジョイントを全て開放
      // updatedData.push({
      //   id: railId,
      //   opposingJoints: null
      // })
      //
      // this.props.layout.updateRails(updatedData)
    }

    /**
     * ジョイントを接続する。
     */
    connectJoints = (pairs: JointPair[]) => {
      this.props.layoutLogic.connectJoints(pairs)
      // const target =_.flatMap(pairs, pair => {
      //   return [
      //     {
      //       id: pair.from.railId,
      //       opposingJoints: {
      //         [pair.from.jointId]: pair.to
      //       }
      //     },
      //     {
      //       id: pair.to.railId,
      //       opposingJoints: {
      //         [pair.to.jointId]: pair.from
      //       }
      //     }
      //   ]
      // })
      //
      // this.props.layout.updateRails(target)
    }


    /**
     * ジョイントの検出状態を変更する。
     * @param {JointPair[]} pairs
     * @param {DetectionState} state
     * @param {boolean} isError
     */
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
     * @param {number[]} railIds
     */
    selectRails = (railIds: number[]) => {
      LOGGER.info('withBuilder#selectRails', railIds)
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
     * レールの選択状態をトグルする。
     * @param {RailData} railData
     */
    toggleRail = (railData: RailData, deselectOthers: boolean) => {
      if (deselectOthers) {
        this.deselectAllRails()
      }
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

    /**
     * 選択中のレールを新しいレールグループとして登録する
     * @param {string} name
     * @param {boolean} shouldDelete
     */
    registerRailGroup = (name: string, shouldDelete: boolean) => {
      const rails = this.getSelectedRails()
      if (rails.length === 0) {
        this.props.snackbar.showMessage(`Please select at least one rail.`)  //`
        return
      }
      this.registerRailGroupInner(rails, name)
      if (shouldDelete) {
        this.props.layout.deleteRails(this.props.layout.currentLayoutData.rails.map(rail => {
          return {
            id: rail.id
          }
        }))
      } else {
        this.deselectAllRails()
      }
    }

    private registerRailGroupInner = (rails: RailData[], name: string) => {
      // このレールグループメンバーのレールID
      const memberRailIds = rails.map(r => r.id)
      const openJoints = []
      rails.map((rail, idx) => {
        // 他のメンバーに接続されているジョイントだけをリストアップする
        const opposingJointIds = _.toPairs(rail.opposingJoints)
          .filter(([k, v]) => memberRailIds.includes(v.railId))
          .map(([k, v]) => Number(k))
        // このレールのジョイント数を取得し、未接続ジョイントのIDをリストアップする
        const numJoints = getRailComponent(rail.id).props.numJoints
        const openJointIds = _.without(_.range(numJoints), ...opposingJointIds)
        openJointIds.forEach(id => openJoints.push({ railId: idx, jointId: id }))
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
        position: new Point(0, 0),
        angle: 0,
        openJoints: openJoints
      }

      LOGGER.info('withBuilder#registerRailGroupInner', railGroup)
      this.props.builder.addUserRailGroup(railGroup)
    }


    render() {
      return (
        <>
          <WrappedComponent
            {...this.props}
            builderMouseDown={this.mouseDown}
            builderMouseMove={this.mouseMove}
            builderKeyDown={this.keyDown}
            builderKeyUp={this.keyUp}
            builderGetRailItemData={this.getRailItemData}
            builderGetRailGroupItemData={this.getUserRailGroupItemData}
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
            builderDeleteSelectedRails={this.deleteSelectedRails}
            builderRegisterRailGroup={this.registerRailGroup}
          />
        </>
      )
    }

    private dialogExists = () => {
      const dialogDivs = $('div[role="dialog"]')
      return dialogDivs.length > 0
    }

    private getRailDataById = (id: number) => {
      return this.props.layout.currentLayoutData.rails.find(item => item.id === id)
    }

    private getSelectedRails = () => {
      return this.props.layout.currentLayoutData.rails.filter(r => r.selected)
    }
  }

  return compose<WithBuilderProps, WithBuilderProps>(
    withSnackbar()
  )(WithBuilder)
}


