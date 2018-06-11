// import {RailComponentClasses, RailData, RailGroupData, RailItemData} from "components/rails";
// import {FeederInfo, JointInfo} from "components/rails/RailBase";
// import {RailGroupProps} from "components/rails/RailGroup/RailGroup";
// import {action, computed, observable, reaction, when} from "mobx";
// import {TEMPORARY_RAIL_OPACITY, Tools} from "constants/tools";
// import builderPaletteData from "constants/builderPaletteItems.json"
// import layoutStore from "store/layoutStore";
// import layoutLogicStore from "store/layoutLogicStore";
// import builderStore from "store/builderStore";
// import railItems from "constants/railItems.json"
// import getLogger from "logging";
// import PartGroup from "components/rails/parts/primitives/PartGroup";
//
// const LOGGER = getLogger(__filename)
//
//
// export class BuilderLogicStore {
//
//   constructor() {
//
//   }
//
//   /**
//    * 指定の名前のレールの固有Propsを返す。
//    * プリセットのレールに無ければユーザーカスタムレールで探して返す。
//    * @param {string} name
//    * @returns {any}
//    */
//   getRailItemData = (name?: string) => {
//     if (!name) {
//       name = builderStore.paletteItem.name
//     }
//     const presetItem = railItems.items.find(item => item.name === name)
//     if (presetItem) {
//       return presetItem
//     }
//     const customRail = builderStore.userRails.find(item => item.name === name)
//     if (customRail) {
//       return customRail
//     }
//     return null
//   }
//
//   /**
//    * 指定の名前のユーザー登録済みレールグループデータを返す。
//    * @param {string} name
//    * @returns {any}
//    */
//   getUserRailGroupItemData = (name?: string) => {
//     if (!name) {
//       name = builderStore.paletteItem.name
//       if (builderStore.paletteItem.type !== 'RailGroup') {
//         return null
//       }
//     }
//     const railGroup = builderStore.userRailGroups.find(rg => rg.name === name)
//     if (railGroup) {
//       return railGroup
//     }
//     return null
//   }
//
//   /**
//    * 仮レールを設置する。
//    * @param {RailData} railData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
//    */
//   @action
//   setTemporaryRail = (railData: RailData) => {
//     // 仮レールデータ
//     const tempRail = {
//       ...railData,
//       id: -1,                             // 仮のレールID
//       name: 'TemporaryRail',              //
//       layerId: -1,                        // 仮のレイヤーに設置
//       enableJoints: false,                // ジョイントを無効化
//       opacity: TEMPORARY_RAIL_OPACITY,    // 半透明
//       visible: true,
//     }
//     // 仮レール設置
//     builderStore.setTemporaryRail(tempRail)
//     // 近傍ジョイントを検出状態に変更する
//     this.setCloseJointsDetecting()
//     // 重なりをチェックする
//     const intersects = this.checkIntersections()
//     LOGGER.info('withBuilder#setTemporaryRail', railData, 'intersects:', intersects)
//   }
//
//   /**
//    * 仮レールグループを設置する。
//    * @param {RailGroupData} railGroupData position, angle, pivotJointIndex などの位置に関する情報を含むこと。
//    * @param {RailData[]} childRails
//    */
//   @action
//   setTemporaryRailGroup = (railGroupData: RailGroupData, childRails: RailData[]) => {
//     // 仮レールグループメンバー
//     const children = childRails.map((r, idx) => {
//       return {
//         ...r,
//         id: -2 - idx,                       // 仮のレールIDを割り当て
//         name: 'TemporaryRail',              //
//         layerId: -1,                        // 仮のレイヤーに設置
//         enableJoints: false,                // ジョイントを無効化
//         opacity: TEMPORARY_RAIL_OPACITY,    // 半透明
//         visible: true,
//       }
//     })
//
//     // 仮レールグループデータ
//     const railGroup: RailGroupData = {
//       ...railGroupData,
//       type: 'RailGroup',
//       id: -1,                                   // 仮のレールグループIDを割り当て
//       name: 'TemporaryRailGroup',               //
//       rails: children.map(c => c.id)  // メンバーレール
//     }
//
//     // 仮レールグループ設置
//     this.props.builder.setTemporaryRailGroup(railGroup, children)
//     // 近傍ジョイントを検出状態に変更する
//     this.setCloseJointsDetecting()
//     // 重なりをチェックする
//     const intersects = this.checkIntersections()
//     LOGGER.info('withBuilder#setTemporaryRailGroup', railGroup, children, 'intersects:', intersects)
//   }
//
//   connectCloseJoints = () => {
//     this.connectJoints(this.props.layout.unconnectedCloseJoints)
//   }
//
//   setCloseJointsDetecting = () => {
//     this.changeJointState(this.props.layout.unconnectedCloseJoints, DetectionState.DETECTING)
//   }
//
//   checkIntersections = () => {
//     const {temporaryRails} = this.props.builder;
//     const {currentLayoutData, activeLayerRails} = this.props.layout;
//
//     const jointsCloseToTempRail = _.flatMap(temporaryRails, r => getCloseJointsOf(r.id, currentLayoutData.rails))
//     // const closeJointPairForTempRail = this.props.layout.unconnectedCloseJoints.filter(ji => ji.from.railId === -1)
//     const targetRailIds = _.without(activeLayerRails.map(rail => rail.id), ...jointsCloseToTempRail.map(j => j.to.railId))
//     const intersects = temporaryRails.map(r => intersectsOf(r.id, targetRailIds)).some(e => e)
//     LOGGER.info("Temporary rail's close joints", jointsCloseToTempRail)
//
//     this.props.builder.setIntersects(intersects)
//     return intersects
//   }
// }
//
//
// export default new BuilderLogicStore()

