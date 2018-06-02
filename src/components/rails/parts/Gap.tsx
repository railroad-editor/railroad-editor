import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import DetectablePart from "./primitives/DetectablePart";
import RectPart from "components/rails/parts/primitives/RectPart";
import getLogger from "logging";
import {GAP_FILL_COLOR, GAP_HEIGHT, GAP_WIDTH} from "constants/parts";

const LOGGER = getLogger(__filename)

interface GapProps extends Partial<DefaultProps> {
}

interface DefaultProps {
  position?: Point
  angle?: number
  data?: any
  selected?: boolean
  opacity?: number
  visible?: boolean
  fillColor?: string
  hasOpposingGap?: boolean
  detectionEnabled?: boolean
}


export default class Gap extends React.Component<GapProps, {}> {
  public static defaultProps: DefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    selected: false,
    opacity: 1,
    visible: true,
    fillColor: GAP_FILL_COLOR,
    hasOpposingGap: false,
    detectionEnabled: true
  }

  part: DetectablePart

  constructor(props: GapProps) {
    super(props)
  }

  // ========== Public APIs ==========

  get position() {
    return this.part.position
  }

  get globalPosition() {
    return this.part.globalPosition
  }

  get angle() {
    return this.part.angle
  }

  get globalAngle() {
    return this.part.globalAngle
  }


  // ========== Private methods ==========

  render() {
    const { position, angle, opacity, fillColor, visible } = this.props

    return (
      <RectPart
        width={GAP_WIDTH}
        height={GAP_HEIGHT}
        opacity={opacity}
        position={position}
        angle={angle}
        pivot={undefined}
        visible={visible}
        fillColor={fillColor}
        name={name}
      />
    )
  }
}
