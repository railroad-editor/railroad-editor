import * as React from "react";
import {Point} from "paper";
import {Group as GroupComponent} from "react-paper-bindings";
import PartBase, {PartBaseDefaultProps, PartBaseProps, Pivot} from "components/rails/parts/primitives/PartBase";
import getLogger from "logging";

const logger = getLogger(__filename)


interface PartGroupProps extends PartBaseProps {
  pivotPartIndex?: number
}

interface PartGroupState {
  fixed: boolean
}

export default class PartGroup extends PartBase<PartGroupProps, PartGroupState> {
  public static defaultProps: PartBaseDefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    pivot: Pivot.CENTER,
    fillColor: undefined,
    visible: true,
    opacity: 1,
    selected: false,
  }

  constructor(props: PartGroupProps) {
    super(props)
    this.state = {
      fixed: false
    }
    this._children = this.props.children ? new Array((this.props.children as any[]).length) : []
  }

  _children: PartBase<any, any>[]

  // ========== Public APIs ==========

  get children() {
    return this._children
  }

  get group() {
    return this._path
  }

  componentDidUpdate() {
    this.setPivotAndPosition()

    logger.trace(
      `[PartGroup][${name}] update(): 
      position=${this.group.position}, pivot=${this.group.pivot}, bounds=${this.group.bounds}`)
  }

  componentDidMount() {
    // PivotまたはPivotPartの指定がある場合、ここでPivot位置を確定させて再描画する
    this.setPivotAndPosition()
    this.setState({fixed: true})

    logger.trace(
      `[PartGroup][${name}] mount(): 
      position=${this.group.position}, pivot=${this.group.pivot}, bounds=${this.group.bounds}`)
  }

  createPathData = (props) => { return null }

  render() {
    const {
      pivot, fillColor, visible, opacity, selected, name, data,
      onMouseDown, onMouseDrag, onMouseUp, onDoubleClick, onMouseMove, onMouseEnter, onMouseLeave
    } = this.props

    // 子要素のメソッドを呼び出す必要があるので、refをそれらのpropsに追加する
    // TODO: childrenが空の時のエラー処理
    const children = React.Children.map(this.props.children, (child: any, i) => {
      // 動的に子要素を削除された場合、nullが入ってくるので対処する
      if (child) {
        return React.cloneElement(child as any, {
          ...child.props,
          ref: (node) => {
            if (node) this._children[i] = node
          }
        })
      }
      return null
    })

    // 最初のrenderが呼ばれた時点ではまだ子が描画されていないので、Pivotの位置を確定できない
    // componentDidMountが呼ばれたらPivotを計算して再描画する
    let pivotPoint, position, angle
    if (this.props.pivotPartIndex != null && this.state.fixed) {
      pivotPoint = this.getInternalPivotPosition(pivot)
    }
    position = this.props.position
    angle = this.props.angle

    logger.trace(`[PartGroup][${name}] render(): position=${position}, pivot=${pivotPoint}`)

    return (
      <GroupComponent
        pivot={pivotPoint}
        position={position}
        rotation={angle}
        fillColor={fillColor}
        visible={visible}
        opacity={opacity}
        selected={selected}
        name={name}
        data={data}
        onMouseDown={onMouseDown}
        onMouseDrag={onMouseDrag}
        onMouseUp={onMouseUp}
        onClick={this.onClick}
        onDoubleClick={onDoubleClick}
        onMouseMove={onMouseMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        // refには一瞬だけ引数にnullが入ってくることがある。(https://github.com/facebook/react/issues/4533)
        // 直後に再度呼ばれて本物が入ってくるが、あまり凝ったことはせずにシンプルに保つべき
        ref={this.getRef}
      >
        {children}
      </GroupComponent>
    )
  }

  protected getInternalPivotPosition(pivot: Pivot) {
    // PivotPartIndexが指定されていたら、指定のパーツのPivotを使用する
    // そうでなければBoundingBoxのPivotを使用する
    if (this.props.pivotPartIndex != null) {
      return this._children[this.props.pivotPartIndex].getPosition(pivot)
    } else {
      return this.getPivotPositionFromBounds(pivot)
    }
  }

  protected getPivotPositionFromBounds(pivot: Pivot) {
    switch (pivot) {
      case Pivot.LEFT:
        return this.group.parentToLocal(this.group.bounds.leftCenter)
      case Pivot.TOP:
        return this.group.parentToLocal(this.group.bounds.topCenter)
      case Pivot.RIGHT:
        return this.group.parentToLocal(this.group.bounds.rightCenter)
      case Pivot.BOTTOM:
        return this.group.parentToLocal(this.group.bounds.bottomCenter)
      case Pivot.CENTER:
      default:
        return this.group.parentToLocal(this.group.bounds.center)
    }
  }

  private setPivotAndPosition() {
    // もしGroupが入れ子になっていて、親GroupがこのGroupをPivotとして指定した場合、再描画を待たなければならない問題がある
    // それでは不便なので、ここでPaperJSのGroupを直接触ってpivot, positionを実質的に設定する
    // TODO: より上手い方法が無いか考える
    const {pivot, pivotPartIndex} = this.props
    if (pivot == null && pivotPartIndex == null) {
      this.group.position = this.props.position
    } else {
      this.group.pivot = this.getInternalPivotPosition(this.props.pivot)
      this.group.position = this.props.position
    }
  }
}


