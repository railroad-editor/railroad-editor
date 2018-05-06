import * as React from "react";
import {ReactElement} from "react";
import {Group} from "react-paper-bindings";
import PartBase, {PartBaseProps} from "components/rails/parts/primitives/PartBase";
import PartGroup from "components/rails/parts/primitives/PartGroup";


export interface DetectablePartProps extends PartBaseProps {
  mainPart: ReactElement<PartBase<PartBaseProps, {}>>         // 本体のコンポーネント
  detectionPart: ReactElement<PartBase<PartBaseProps, {}>>    //  当たり判定のコンポーネント
  fillColors: string[]    // DetectionState ごとの本体、当たり判定の色
  onLeftClick?: (e: MouseEvent) => boolean
  onRightClick?: (e: MouseEvent) => boolean
  detectionEnabled: boolean
  pivotPartIndex?: number
}

export interface DetectablePartState {
  detectionState: DetectionState
  detectionPartVisible: boolean
  isError: boolean
}

/**
 * 当たり判定による検出状態。
 */
export enum DetectionState {
  DISABLED = 0,
  BEFORE_DETECT,  // 検出前
  DETECTING,          // 検出中（カーソルが当たっている）
  AFTER_DETECT        // 検出後（クリックなどにより選択された）
}


export default class DetectablePart extends React.Component<DetectablePartProps, DetectablePartState> {

  onMouseMove = (e: MouseEvent) => {
    // 検出中状態を他のPathに邪魔されないよう、前面に出し続ける
    if (this.isDetecting()) {
      this._partGroup.group.bringToFront()
      // TODO: 位置はここでいいか？
      if (this.props.onMouseMove) {
        this.props.onMouseMove(e)
      }
    }
  }
  onMouseEnter = (e: MouseEvent) => {
    // 検出前状態なら検出中状態に移行し、コールバックを呼んでやる
    if (this.isBeforeDetect()) {
      this.setState({
        detectionState: DetectionState.DETECTING,
        detectionPartVisible: true
      })
      if (this.props.onMouseEnter) {
        this.props.onMouseEnter(e)
      }
    }
  }

  // ========== Public APIs ==========
  onMouseLeave = (e: MouseEvent) => {
    // 検出中状態なら検出前状態に移行し、コールバックを呼んでやる
    if (this.isDetecting()) {
      this.setState({
        detectionState: DetectionState.BEFORE_DETECT,
        detectionPartVisible: true
      })
      if (this.props.onMouseLeave) {
        this.props.onMouseLeave(e)
      }
    }
  }
  onClick = (e: MouseEvent | any) => {
    let shouldChangeState = false
    switch (e.event.button) {
      case 0:
        if (this.props.onLeftClick) {
          shouldChangeState = this.props.onLeftClick(e)
        }
        break
      case 2:
        if (this.props.onRightClick) {
          shouldChangeState = this.props.onRightClick(e)
        }
        break
    }
    // コールバックがtrueを返した時のみ状態を変更する
    if (shouldChangeState) {
      this.setState({
        detectionState: DetectionState.AFTER_DETECT,
        detectionPartVisible: false
      })
    }
  }

  constructor(props: DetectablePartProps) {
    super(props)
    if (this.props.detectionEnabled) {
      this.state = {
        detectionState: DetectionState.BEFORE_DETECT,
        detectionPartVisible: true,
        isError: false,
      }
    } else {
      this.state = {
        detectionState: DetectionState.DISABLED,
        detectionPartVisible: false,
        isError: false,
      }
    }
    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onClick = this.onClick.bind(this)
    this.getInstance = this.getInstance.bind(this)
  }

  _partGroup: PartGroup

  get partGroup() {
    return this._partGroup
  }

  get mainPart() {
    return this._partGroup._children[0]
  }

  // ========== Private methods ==========

  get detectionPart() {
    return this._partGroup._children[1]
  }

  get position() {
    return this._partGroup.position
  }

  get globalPosition() {
    return this._partGroup.globalPosition
  }

  get angle() {
    return this._partGroup.angle
  }

  get globalAngle() {
    return this._partGroup.globalAngle
  }

  resetDetectionState() {
    this.setState({
      detectionState: DetectionState.BEFORE_DETECT
    })
  }

  isDetecting() {
    return this.props.detectionEnabled && this.state.detectionState == DetectionState.DETECTING
  }

  isBeforeDetect() {
    return this.props.detectionEnabled && this.state.detectionState == DetectionState.BEFORE_DETECT
  }

  // detectionEnabledが OFF -> ON になった場合は状態をリセットする
  componentWillReceiveProps(nextProps: DetectablePartProps) {
    if (!this.props.detectionEnabled && nextProps.detectionEnabled) {
      this.setState({
        detectionState: DetectionState.BEFORE_DETECT,
        detectionPartVisible: true
      })
    }
  }

  render() {
    const {
      position, angle, pivot, pivotPartIndex, fillColors, selected, name, data, detectionEnabled,
      mainPart, detectionPart, visible, opacity
    } = this.props
    const {detectionState, isError} = this.state

    // 主パーツの色を変更
    let clonedMainPart = React.cloneElement(mainPart as any, {
      ...mainPart.props,
      visible: true,
      fillColor: fillColors[this.state.detectionState],
      name: 'main'
    })

    // 検出パーツの色を変更
    // 検出無効状態なら描画しない
    let clonedDetectionPart
    if (detectionEnabled) {
      const color = detectionState === DetectionState.DETECTING && isError ? 'red' : fillColors[detectionState]
      clonedDetectionPart = React.cloneElement(detectionPart as any, {
        ...detectionPart.props,
        visible: detectionEnabled ? this.state.detectionState : false,
        fillColor: color,
        name: 'detect',
      })
    }

    return (
      <PartGroup
        position={position}
        angle={angle}
        pivot={pivot}
        pivotPartIndex={pivotPartIndex}
        // fillColor={fillColor}
        visible={visible}
        opacity={opacity}
        selected={selected}
        name={name}
        data={data}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onMouseMove={this.onMouseMove}
        onClick={this.onClick}
        ref={this.getInstance}
      >
        {clonedMainPart}
        {detectionEnabled && clonedDetectionPart}
      </PartGroup>
    )
  }

  protected getInstance(_partGroup) {
    if (_partGroup) this._partGroup = _partGroup
  }
}
