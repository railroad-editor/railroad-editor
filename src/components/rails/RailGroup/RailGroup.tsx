import * as React from "react";
import {Group as GroupComponent} from "react-paper-bindings";
import getLogger from "logging";
import {JointInfo, RailBase} from "components/rails/RailBase";
import {Group, Point} from "paper";

const LOGGER = getLogger(__filename)


export interface RailGroupProps extends Partial<RailGroupDefaultProps> {
  position: Point2D
  angle: number
  id: number
  pivotJointInfo?: JointInfo
  onMount?: (instance: RailGroup) => void
  onUnmount?: (instance: RailGroup) => void
}

export interface RailGroupDefaultProps {
  type: string
  visible: boolean
  enableJoints: boolean
  name: string
}


export default class RailGroup extends React.Component<RailGroupProps, {}> {
  public static defaultProps: RailGroupDefaultProps = {
    type: 'RailGroup',
    visible: true,
    enableJoints: true,
    name: 'No name',
  }

  _group: Group
  _children: RailBase<any, any>[]
  pivotPosition: Point
  pivotAngle: number

  get children() {
    return this._children
  }

  get group() {
    return this._group
  }

  constructor(props: RailGroupProps) {
    super(props)
    this._children = this.props.children ? new Array((this.props.children as any[]).length) : []
    this.pivotPosition = new Point(this.props.position)
    this.pivotAngle = 0
  }


  private setInternal() {
    LOGGER.debug('RailGroup#setInternal', this.group, this.group ? this.group.children : '')
    if (this.group.children.length > 0) {
      this.group.pivot = this.getPivotPosition()
      this.group.position = new Point(this.props.position)
      this.group.rotation = this.getAngle()
    }
  }

  componentDidUpdate() {
    this.setInternal()
  }

  componentDidMount() {
    this.setInternal()
    if (this.props.onMount) {
      this.props.onMount(this)
    }
  }


  render() {
    const {position, angle, visible} = this.props
    const children = this.getChildComponents()
    const pivotPosition = this.getPivotPosition()
    const groupAngle = this.getAngle()

    LOGGER.debug('RailGroup#render', this.group, children, angle, pivotPosition, groupAngle)

    return (
      <GroupComponent
        pivot={pivotPosition}
        position={position}
        rotation={groupAngle}
        visible={visible}
        ref={(group) => this._group = group}
      >
        {children}
      </GroupComponent>
    )
  }

  public getAngle() {
    return this.props.angle - this.getInternalPivotAngle() + 180
  }

  private getPivotPosition = () => {
    const {pivotJointInfo} = this.props
    if (! pivotJointInfo) {
      return undefined
    }

    if (this.children[pivotJointInfo.railId]) {
      // 指定のPivotRailのPivotJointの位置を取得し、保存
      this.pivotPosition = this.children[pivotJointInfo.railId].railPart.getJointPositionToParent(pivotJointInfo.jointId)
    }
    // 指定のPivotRailIndexのレールが削除されていた場合、保存しておいたPivotPositionをそのまま使う
    return this.pivotPosition
  }


  private getInternalPivotAngle = () => {
    const {pivotJointInfo} = this.props
    if (! pivotJointInfo) {
      return 0
    }
    if (this.children[pivotJointInfo.railId]) {
      // 指定のPivotRailのPivotJointの角度を取得し、保存
      this.pivotAngle = this.children[pivotJointInfo.railId].railPart.getJointAngleToParent(pivotJointInfo.jointId)
    }
    // 指定のPivotRailIndexのレールが削除されていた場合、保存しておいたPivotAngleをそのまま使う
    return this.pivotAngle
  }


  private getChildComponents = () => {
    // 子要素のメソッドを呼び出す必要があるので、refをそれらのpropsに追加する
    // TODO: childrenが空の時のエラー処理
    return React.Children.map(this.props.children, (child: any, i) => {
      // 動的に子要素を削除された場合、nullが入ってくるので対処する
      if (child) {
        return React.cloneElement(child as any, {
          ...child.props,
          onMount: (node) => {
            if (child.props.onMount) {
              child.props.onMount(node)
            }
            this._children[i] = node
          },
          onUnmount: (node) => {
            if (child.props.onUnmount) {
              child.props.onUnmount(node)
            }
            this._children[i] = null
          }
        })
      }
      return null
    })
  }
}

