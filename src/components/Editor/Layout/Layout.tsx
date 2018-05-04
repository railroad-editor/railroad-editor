import * as React from "react";
import {Layer} from "react-paper-bindings";
import {
  createRailComponent,
  createRailGroupComponent,
  createRailOrRailGroupComponent,
  getCloseJointsOf,
  intersectsOf
} from "components/rails/utils";
import getLogger from "logging";
import {default as withBuilder, JointPair} from "components/hoc/withBuilder";
import {DetectionState} from "components/rails/parts/primitives/DetectablePart";
import shallowEqualObjects from "shallow-equal/objects"
import {compose} from "recompose";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";

const LOGGER = getLogger(__filename)


export interface LayoutProps {
  layout?: LayoutStore
  builder?: BuilderStore
  // temporaryRails: RailData[]
  // temporaryRailGroup: RailGroupData
  // activeLayerId: number
  // activeLayerData: LayerData

  builderDisconnectJoint: (railId: number) => void
  builderConnectJoints: (pairs: JointPair[]) => void
  builderChangeJointState: (pairs: JointPair[], state: DetectionState, isError?: boolean) => void
  setIntersects: (is: boolean) => void
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export class Layout extends React.Component<LayoutProps, {}> {

  temporaryCloseJoints: JointPair[]

  constructor(props: LayoutProps) {
    super(props)
    this.temporaryCloseJoints = []
  }

  componentDidUpdate(prevProps: LayoutProps) {

    // レイアウトのレールが追加・削除されたら、近傍ジョイントを探して自動的に接続する
    // if (this.props.layout.currentLayoutData.rails.length !== prevProps.layout.currentLayoutData.rails.length) {
    //   this.connectCloseJoints()
    // }

    // 仮レールが追加または可視状態に変わった場合、近傍ジョイントを探して検出状態にする
    // TODO: 右クリックに対応できない。仮レールが変更された場合、で決め打ちしたほうがよいかも
    // if (temporaryRailHasChangedVisible(this.props, prevProps)) {
    //   this.validateAddedTemporaryRails()
    // }
    //
    // // 仮レールが削除または不可視状態に変わった場合、近傍ジョイントを探して非検出状態にする
    // if (temporaryRailHasChangedInvisible(this.props, prevProps)) {
    //   this.validateDeletedTemporaryRails()
    // }
  }



  validateAddedTemporaryRails = () => {
    const {temporaryRails, activeLayerId} = this.props.builder;
    const {currentLayoutData} = this.props.layout;
    // レールの重なりを検出する。検査対象はアクティブレイヤーかつ、仮レールの近傍ジョイントを持たないレール
    // 仮レールの近傍ジョイン
    this.temporaryCloseJoints = _.flatMap(temporaryRails, r => getCloseJointsOf(r.id, currentLayoutData.rails))
    // アクティブレイヤーのレール
    const railsInActiveLayer = currentLayoutData.rails.filter(r => r.layerId === activeLayerId).map(r => r.id)
    // 検査対象
    const intersectionTestTargets = _.without(railsInActiveLayer, ...this.temporaryCloseJoints.map(j => j.to.railId))
    // 重なりを検査
    const intersects = temporaryRails.map(r => intersectsOf(r.id, intersectionTestTargets)).some(e => e)
    LOGGER.info("Temporary rail's close joints", this.temporaryCloseJoints)

    if (intersects) {
      this.props.setIntersects(true)
      LOGGER.info('Intersection detected')
    } else {
      this.props.setIntersects(false)
      this.props.builderChangeJointState(this.temporaryCloseJoints, DetectionState.DETECTING)
    }
  }


  validateDeletedTemporaryRails = () => {
    this.props.builderChangeJointState(this.temporaryCloseJoints, DetectionState.BEFORE_DETECT)
    this.temporaryCloseJoints = []
  }


  render() {
    const {temporaryRails, temporaryRailGroup} = this.props.builder
    const {currentLayoutData, activeLayerData} = this.props.layout;

    LOGGER.debug('Layout render()')

    return (
      <React.Fragment>
        <Layer
          key={-1}
          data={{id: -1, name: 'TemporaryLayer'}}
        >
          {
            temporaryRails.length > 0 &&
            createRailOrRailGroupComponent(temporaryRailGroup, temporaryRails,
              { id: -1, name: 'Temporary', visible: true, color: activeLayerData.color})
          }
        </Layer>

        {
          currentLayoutData.layers.map(layer =>
            <Layer
              data={layer}
              visible={layer.visible}
              key={layer.id}
            >
              { // レールグループに所属していないレールを生成する
                currentLayoutData.rails
                  .filter(r => r.layerId === layer.id)
                  .filter(r => ! r.groupId)
                  .map(item => createRailComponent(item, layer))
              }
              { // レールグループに所属しているレールを生成する
                // レールグループ内のレールは同じレイヤーに所属していなくても良い
                currentLayoutData.railGroups
                  .map(item => {
                    const children = currentLayoutData.rails.filter(c => c.groupId === item.id)
                    return createRailGroupComponent(item, children, layer)
                  })
              }
            </Layer>
          )
        }
      </React.Fragment>
    )
  }

}


const temporaryRailHasChangedVisible = (currentProps: LayoutProps, prevProps: LayoutProps) => {
  const currentOnes = currentProps.builder.temporaryRails
  const prevOnes = prevProps.builder.temporaryRails
  // レールが追加された時
  if (currentOnes.length > prevOnes.length) return true
  // レールが現在可視状態で、以前と状態が異なる場合
  if (currentOnes.length > 0 && prevOnes.length > 0 && currentOnes[0].visible
    && ! shallowEqualObjects(currentOnes[0], prevOnes[0])) return true
  return false
}


const temporaryRailHasChangedInvisible = (currentProps: LayoutProps, prevProps: LayoutProps) => {
  const currentOnes = currentProps.builder.temporaryRails
  const prevOnes = prevProps.builder.temporaryRails
  // レールが削除された時
  if (currentOnes.length < prevOnes.length) return true
  // レールが現在不可視状態で、以前と状態が異なる場合
  if (currentOnes.length > 0 && prevOnes.length > 0 && ! currentOnes[0].visible
    && ! shallowEqualObjects(currentOnes[0], prevOnes[0])) return true
  return false
}


export default compose<LayoutProps, LayoutProps|any>(
  withBuilder,
)(Layout)
