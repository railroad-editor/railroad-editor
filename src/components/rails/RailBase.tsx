import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import Joint from "./parts/Joint";
import {pointsEqual} from "components/rails/utils";
import * as _ from "lodash";
import RailPartBase from "components/rails/parts/RailPartBase";
import getLogger from "logging";
import Gap from "components/rails/parts/Gap";

const LOGGER = getLogger(__filename)

export interface JointInfo {
  railId: number
  jointId: number
}

export interface OpposingJoints {
  [key: number]: JointInfo
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
}

export interface RailBaseDefaultProps {
  // このレールの実装クラス名
  type: string
  // ジョイント数
  numJoints: number
  // 右クリックでPivotJointIndexを加算する数
  pivotJointChangingStride: number
  // ギャップ数
  numGaps: number
  // 対向ジョイント情報
  opposingJoints: OpposingJoints
  // ジョイント表示のON/OFF
  enableJoints: boolean
  // 選択状態
  selected: boolean
  // 可視性
  visible: boolean
  // 透明度
  opacity: number
  // 色
  fillColor: string

  // イベントハンドラ
  onRailPartLeftClick: (e: MouseEvent) => boolean
  onRailPartRightClick: (e: MouseEvent) => boolean
  onJointLeftClick: (jointId: number, e: MouseEvent) => void
  onJointRightClick: (jointId: number, e: MouseEvent) => void
  onJointMouseMove: (jointId: number, e: MouseEvent) => void
  onJointMouseEnter: (jointId: number, e: MouseEvent) => void
  onJointMouseLeave: (jointId: number, e: MouseEvent) => void
}

export interface RailBaseState {
  jointPositions: Point[]
  jointAngles: number[]
  gapPositions: Point[]
  gapAngles: number[]
}


export abstract class RailBase<P extends RailBaseProps, S extends RailBaseState> extends React.Component<P, S> {

  public static defaultProps: RailBaseDefaultProps = {
    type: 'RailBase',
    numJoints: 2,
    pivotJointChangingStride: 1,
    numGaps: 0,

    selected: false,
    opposingJoints: {},
    enableJoints: true,
    visible: true,
    opacity: 1,
    fillColor: '#000',

    // 何もしないハンドラをセットしておく
    onRailPartLeftClick: (e: MouseEvent) => false,
    onRailPartRightClick: (e: MouseEvent) => false,
    onJointLeftClick: (jointId: number, e: MouseEvent) => {},
    onJointRightClick: (jointId: number, e: MouseEvent) => {},
    onJointMouseMove: (jointId: number, e: MouseEvent) => {},
    onJointMouseEnter: (jointId: number, e: MouseEvent) => {},
    onJointMouseLeave: (jointId: number, e: MouseEvent) => {},
  }

  railPart: RailPartBase<any, any>
  joints: Joint[]
  gaps: Gap[]


  protected constructor(props: P) {
    super(props)
    this.joints = new Array(this.props.numJoints).fill(null)
    this.gaps = new Array(this.props.numGaps).fill(null)

    this.getInstance = this.getInstance.bind(this)
  }

  getInitialState = (props) => {
    return {
      jointPositions: new Array(this.props.numJoints).fill(props.position),
      jointAngles: new Array(this.props.numJoints).fill(props.angle),
      gapPositions: new Array(this.props.numGaps).fill(props.position),
      gapAngles: new Array(this.props.numGaps).fill(props.angle),
    }
  }

  componentWillUnmount() {
    if (this.props.onUnmount) {
      this.props.onUnmount(this)
    }
  }

  componentDidUpdate() {
    this.fixJoints()
    this.fixGaps()
  }

  componentDidMount() {
    this.fixJoints()
    this.fixGaps()
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
  protected renderJoints = (props) => {
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
            type: 'Gap',
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

  protected renderGaps = (props) => {
    const {id, opacity, visible} = props
    const {gapPositions, gapAngles} = this.state

    return _.range(this.gaps.length).map(i => {
      return (
        <Gap
          key={`g-${i}`} //`
          position={gapPositions[i]}
          angle={gapAngles[i]}
          opacity={opacity}
          visible={visible}
          data={{
            type: 'Gap',
            partId: i,
            railId: id,
          }}
          ref={(gap) => {if (gap) this.gaps[i] = gap}}
        />
      )
    })
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

  private fixGaps() {
    const gapPositions = _.range(this.gaps.length).map(i => _.clone(this.railPart.getPivotPositionToParent(this.railPart.gaps[i])))
    const gapAngles = _.range(this.gaps.length).map(i => _.clone(this.railPart.getPivotAngleToParent(this.railPart.gaps[i])))

    if (_.range(this.gaps.length).every(i =>
      pointsEqual(this.state.gapPositions[i], gapPositions[i])
      && this.state.gapAngles[i] === gapAngles[i])) {
      // noop
    } else {
      this.setState({
        gapPositions,
        gapAngles
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
    return (
      <>
        {this.renderRailPart(this.props)}
        {this.renderJoints(this.props)}
        {this.renderGaps(this.props)}
      </>
    )
  }

  abstract renderRailPart: (props) => React.ReactNode
}

