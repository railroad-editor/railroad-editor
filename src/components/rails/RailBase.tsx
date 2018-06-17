import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import Joint from "./parts/Joint";
import {pointsEqual} from "components/rails/utils";
import * as _ from "lodash";
import RailPartBase from "components/rails/parts/RailPartBase";
import getLogger from "logging";
import FeederSocket from "components/rails/parts/FeederSocket";
import {FlowDirection, Pivot} from "components/rails/parts/primitives/PartBase";
import GapJoiner from "components/rails/parts/GapJoiner";
import Feeder from "components/rails/parts/Feeder";
import GapJoinerSocket from "components/rails/parts/GapJoinerSocket";

const LOGGER = getLogger(__filename)


export interface JointInfo {
  railId: number
  jointId: number
}

export interface FeederInfo {
  // フィーダー自体のID
  id: number
  railId: number
  socketId: number
  pivot: Pivot
  selected: boolean
  direction: FlowDirection
  visible: boolean
  name: string
  powerPackId?: number
}

export interface GapJoinerInfo {
  id: number
  railId: number
  jointId: number
  selected: boolean
}

export interface OpposingJoints {
  [key: number]: JointInfo
}

export interface FlowDirections {
  [key: number]: FlowDirection
}


export interface RailBaseProps extends Partial<RailBaseDefaultProps> {
  position: Point
  angle: number
  id: number
  // レールが所属するレイヤーのID
  layerId: number
  // 任意の名前
  name?: string
  // このレールのインスタンスを取得するコールバック
  onMount?: (ref: RailBase<RailBaseProps, RailBaseState>) => void
  onUnmount?: (ref: RailBase<RailBaseProps, RailBaseState>) => void
  // このレールの所属するレールグループのID
  groupId?: number
  // ピボットとなるジョイントのIndex
  pivotJointIndex?: number,

  turnoutId?: number
}

export interface RailBaseDefaultProps {
  // このレールの実装クラス名
  type: string
  // ジョイント数
  numJoints: number
  // 右クリックでPivotJointIndexを加算する数
  pivotJointChangingStride: number
  // フィーダー差し込み口
  numFeederSockets: number
  // 対向ジョイント情報
  opposingJoints: OpposingJoints
  // フィーダー
  feeders: FeederInfo[]
  // ギャップ
  gapJoiners: GapJoinerInfo[]
  // ジョイント表示のON/OFF
  enableJoints: boolean
  // フィーダーソケット表示のON/OFF
  enableFeederSockets: boolean
  // ギャップジョイナー表示のON/OFF
  enableGapJoinerSockets: boolean
  // 選択状態
  selected: boolean
  // 可視性
  visible: boolean
  // 透明度
  opacity: number
  // 色
  fillColor: string

  flowDirections: FlowDirections

  numConductionStates: number

  // イベントハンドラ
  onRailPartLeftClick: (e: MouseEvent) => boolean
  onRailPartRightClick: (e: MouseEvent) => boolean
  onRailPartMouseEnter: (e: MouseEvent) => boolean
  onRailPartMouseLeave: (e: MouseEvent) => boolean

  onJointLeftClick: (jointId: number, e: MouseEvent) => void
  onJointRightClick: (jointId: number, e: MouseEvent) => void
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
  onGapJoinerSocketMouseLeave:(jointId: number, e: MouseEvent) => void
  onGapJoinerSocketLeftClick: (jointId: number, e: MouseEvent) => void
  onGapJoinerLeftClick: (id: number, e: MouseEvent) => void
  onGapJoinerMouseEnter: (id: number, e: MouseEvent) => void
  onGapJoinerMouseLeave: (id: number, e: MouseEvent) => void
}

export interface RailBaseState {
  jointPositions: Point[]
  jointAngles: number[]
  feederSocketPositions: Point[]
  feederSocketAngles: number[]
}


export abstract class RailBase<P extends RailBaseProps, S extends RailBaseState> extends React.Component<P, S> {

  public static defaultProps: RailBaseDefaultProps = {
    type: 'RailBase',
    numJoints: 2,
    pivotJointChangingStride: 1,
    numFeederSockets: 0,
    feeders: [],
    gapJoiners: [],

    selected: false,
    opposingJoints: {},
    enableJoints: true,
    visible: true,
    opacity: 1,
    fillColor: '#000',

    flowDirections: {},

    enableFeederSockets: false,
    enableGapJoinerSockets: false,

    numConductionStates: 1,

    // 何もしないハンドラをセットしておく
    onRailPartLeftClick: (e: MouseEvent) => false,
    onRailPartRightClick: (e: MouseEvent) => false,
    onRailPartMouseEnter: (e: MouseEvent) => false,
    onRailPartMouseLeave: (e: MouseEvent) => false,

    onJointLeftClick: (jointId: number, e: MouseEvent) => {},
    onJointRightClick: (jointId: number, e: MouseEvent) => {},
    onJointMouseMove: (jointId: number, e: MouseEvent) => {},
    onJointMouseEnter: (jointId: number, e: MouseEvent) => {},
    onJointMouseLeave: (jointId: number, e: MouseEvent) => {},

    onFeederSocketMouseEnter: (feederId: number, e: MouseEvent) => {},
    onFeederSocketMouseLeave: (feederId: number, e: MouseEvent) => {},
    onFeederSocketLeftClick: (feederId: number, e: MouseEvent) => {},
    onFeederSocketRightClick: (feederId: number, e: MouseEvent) => {},
    onFeederMouseEnter: (id: number, e: MouseEvent) => {},
    onFeederMouseLeave: (id: number, e: MouseEvent) => {},
    onFeederLeftClick: (id: number, e: MouseEvent) => {},

    onGapJoinerSocketMouseEnter: (feederId: number, e: MouseEvent) => {},
    onGapJoinerSocketMouseLeave: (feederId: number, e: MouseEvent) => {},
    onGapJoinerSocketLeftClick: (feederId: number, e: MouseEvent) => {},
    onGapJoinerMouseEnter: (id: number, e: MouseEvent) => {},
    onGapJoinerMouseLeave: (id: number, e: MouseEvent) => {},
    onGapJoinerLeftClick: (id: number, e: MouseEvent) => {},
  }

  railPart: RailPartBase<any, any>
  joints: Joint[]
  feederSockets: FeederSocket[]
  feeders: Feeder[]
  gapJoinerSockets: GapJoinerSocket[]
  gapJoiners: GapJoiner[]


  protected constructor(props: P) {
    super(props)
    this.joints = new Array(this.props.numJoints).fill(null)
    this.feederSockets = new Array(this.props.numFeederSockets).fill(null)
    this.feeders = new Array(this.props.numFeederSockets).fill(null)
    this.gapJoinerSockets = new Array(this.props.numJoints).fill(null)
    this.gapJoiners = new Array(this.props.numJoints).fill(null)

    this.getInstance = this.getInstance.bind(this)
  }

  getInitialState = (props) => {
    return {
      jointPositions: new Array(this.props.numJoints).fill(props.position),
      jointAngles: new Array(this.props.numJoints).fill(props.angle),
      feederSocketPositions: new Array(this.props.numFeederSockets).fill(props.position),
      feederSocketAngles: new Array(this.props.numFeederSockets).fill(props.angle),
    }
  }

  componentWillUnmount() {
    if (this.props.onUnmount) {
      this.props.onUnmount(this)
    }
  }

  componentDidUpdate() {
    this.fixJoints()
    this.fixFeederSockets()
  }

  componentDidMount() {
    this.fixJoints()
    this.fixFeederSockets()
    // HOCを用いる場合、refではラップされたコンテナを取得することになってしまう
    // そのためonMountコールバックでコンポーネントインスタンスを取得する手段を与える
    if (this.props.onMount) {
      this.props.onMount(this)
    }
    LOGGER.info(`Rail ${this.props.id} mounted.`) //`
  }

  /**
   * ジョイントコンポーネントを生成する
   * @returns {any[]}
   */
  protected renderJoints = (props: P) => {
    const {id, opacity, opposingJoints, enableJoints, visible} = props
    const {jointPositions, jointAngles} = this.state

    return _.range(this.joints.length).map(i => {
      return (
        <Joint
          key={`j-${i}`}  //`
          position={jointPositions[i]}
          angle={jointAngles[i]}
          opacity={opacity}
          visible={visible}
          data={{
            type: 'Joint',
            partId: i,
            railId: id,
          }}
          detectionEnabled={enableJoints}
          hasOpposingJoint={opposingJoints[i] != null}
          onLeftClick={this.props.onJointLeftClick.bind(this, i)}
          onRightClick={this.props.onJointRightClick.bind(this, i)}
          onMouseMove={this.props.onJointMouseMove.bind(this, i)}
          onMouseEnter={this.props.onJointMouseEnter.bind(this, i)}
          onMouseLeave={this.props.onJointMouseLeave.bind(this, i)}
          ref={(joint) => {if (joint) this.joints[i] = joint}}
        />
      )
    })
  }

  /**
   * フィーダーソケット・フィーダーを生成
   */
  protected renderFeederSockets = (props: RailBaseProps) => {
    const {id, opacity, visible, feeders, enableFeederSockets} = props
    const {feederSocketPositions, feederSocketAngles} = this.state

    const feederSocketComponents = _.range(this.feederSockets.length).map(i => {
      const hasFeeder = feeders.map(feeder => feeder.socketId).includes(i)
      return (
          <FeederSocket
            key={`fs-${i}`} //`
            position={feederSocketPositions[i]}
            angle={feederSocketAngles[i]}
            opacity={opacity}
            visible={visible && enableFeederSockets}
            detectionEnabled={enableFeederSockets && !hasFeeder}
            hasFeeder={hasFeeder}
            data={{
              type: 'FeederSocket',
              partId: i,
              railId: id,
            }}
            onLeftClick={this.props.onFeederSocketLeftClick.bind(this, i)}
            onRightClick={this.props.onFeederSocketRightClick.bind(this, i)}
            onMouseEnter={this.props.onFeederSocketMouseEnter.bind(this, i)}
            onMouseLeave={this.props.onFeederSocketMouseLeave.bind(this, i)}
            ref={(fs) => {if (fs) this.feederSockets[i] = fs}}
          />
      )
    })

    const feederComponents = feeders.map(feeder => {
      return (
        <Feeder
          id={feeder.id}
          position={feederSocketPositions[feeder.socketId]}
          angle={feederSocketAngles[feeder.socketId]}
          direction={feeder.direction}
          visible={visible}
          selected={feeder.selected}
          data={{
            type: 'Feeder',
          }}
          onLeftClick={this.props.onFeederLeftClick.bind(this, feeder.id)}
          onMouseEnter={this.props.onFeederMouseEnter.bind(this, feeder.id)}
          onMouseLeave={this.props.onFeederMouseLeave.bind(this, feeder.id)}
          ref={(r) => {if (r) this.feeders[feeder.socketId] = r}}
        />
      )
    })

    return (
      <>
        {feederSocketComponents}
        {feederComponents}
      </>
    )
  }

  /**
   * ギャップジョイナーソケット・ギャップジョイナーを生成
   */
  protected renderGapJoiners = (props: P) => {
    const {id, opacity, visible, enableGapJoinerSockets, gapJoiners, opposingJoints} = props
    const {jointPositions, jointAngles} = this.state

    const gapJoinerSocketComponents = _.range(this.gapJoinerSockets.length).map(i => {
      if (opposingJoints[i] && id < opposingJoints[i].railId) {
        const hasGapJoiner = gapJoiners.map(gapJoiner => gapJoiner.jointId).includes(i)
        return (
            <GapJoinerSocket
              key={`gj-${i}`}  //`
              position={jointPositions[i]}
              angle={jointAngles[i]}
              opacity={opacity}
              visible={visible && enableGapJoinerSockets}
              detectionEnabled={enableGapJoinerSockets && !hasGapJoiner}
              hasGapJoiner={hasGapJoiner}
              data={{
                type: 'GapJoinerSocket',
                partId: i,
                railId: id,
              }}
              onLeftClick={this.props.onGapJoinerSocketLeftClick.bind(this, i)}
              onMouseEnter={this.props.onGapJoinerSocketMouseEnter.bind(this, i)}
              onMouseLeave={this.props.onGapJoinerSocketMouseLeave.bind(this, i)}
              ref={(r) => {if (r) this.gapJoinerSockets[i] = r}}
            />
        )
      } else {
        return <></>
      }
    })

    const gapJoinerComponents = gapJoiners.map(gapJoiner => {
      return (
        <GapJoiner
          id={gapJoiner.id}
          position={jointPositions[gapJoiner.jointId]}
          angle={jointAngles[gapJoiner.jointId]}
          visible={visible}
          selected={gapJoiner.selected}
          data={{
            type: 'GapJoiner'
          }}
          onLeftClick={this.props.onGapJoinerLeftClick.bind(this, gapJoiner.id)}
          onMouseEnter={this.props.onGapJoinerMouseEnter.bind(this, gapJoiner.id)}
          onMouseLeave={this.props.onGapJoinerMouseLeave.bind(this, gapJoiner.id)}
          ref={(r) => {if (r) this.gapJoiners[gapJoiner.jointId] = r}}
        />
      )
    })

    return (
      <>
        {gapJoinerSocketComponents}
        {gapJoinerComponents}
      </>
    )
  }



  /**
   * レールパーツの位置・角度に合わせてジョイントの位置・角度を変更する
   */
  private fixJoints() {
    // 注意: オブジェクトをStateにセットする場合はきちんとCloneすること
    const jointPositions = _.range(this.joints.length).map(i => _.clone(this.railPart.getPivotPositionToParent(this.railPart.joints[i])))
    const jointAngles = _.range(this.joints.length).map(i => _.clone(this.railPart.getPivotAngleToParent(this.railPart.joints[i])))

    // _.range(this.joints.length).forEach(i => {
    //   LOGGER.debug(`[Rail][${this.props.id}] Joint${i} position: ${this.state.jointPositions[i]} -> ${jointPositions[i]}`)
    //   LOGGER.debug(`[Rail][${this.props.id}] Joint${i} angle: ${this.state.jointAngles[i]} -> ${jointAngles[i]}`)
    // })

    // レールパーツから取得したジョイントの位置・角度が現在のものと異なれば再描画
    if (_.range(this.joints.length).every(i =>
      pointsEqual(this.state.jointPositions[i], jointPositions[i])
      && this.state.jointAngles[i] === jointAngles[i])) {
      // noop
    } else {
      this.setState({
        jointPositions,
        jointAngles
      })
    }
  }


  private fixFeederSockets() {
    const feederSocketPositions = _.range(this.feederSockets.length).map(i => _.clone(this.railPart.getPivotPositionToParent(this.railPart.feederSockets[i])))
    const feederSocketAngles = _.range(this.feederSockets.length).map(i => _.clone(this.railPart.getPivotAngleToParent(this.railPart.feederSockets[i])))

    if (_.range(this.feederSockets.length).every(i =>
      pointsEqual(this.state.feederSocketPositions[i], feederSocketPositions[i])
      && this.state.feederSocketAngles[i] === feederSocketAngles[i])) {
      // noop
    } else {
      this.setState({
        feederSocketPositions,
        feederSocketAngles
      })
    }
  }

  protected getInstance(railPart) {
    if (railPart) this.railPart = railPart
  }

  onFrame = (e) => {
    this.railPart.onFrame(e)
  }

  render() {
    const { onRailPartLeftClick, onRailPartMouseEnter, onRailPartMouseLeave, flowDirections } = this.props

    const railPart = this.renderRailPart(this.props)
    const extendedRailPart = React.cloneElement(railPart as any, {
      ...railPart.props,
      onLeftClick: onRailPartLeftClick,
      onMouseEnter: onRailPartMouseEnter,
      onMouseLeave: onRailPartMouseLeave,
      flowDirections: flowDirections
    })

    return (
      <>
        {extendedRailPart}
        {this.renderJoints(this.props)}
        {this.renderFeederSockets(this.props)}
        {this.renderGapJoiners(this.props)}
      </>
    )
  }

  abstract renderRailPart: (props) => React.ReactElement<any>
}

