import * as React from "react";
import DetectablePart from "./primitives/DetectablePart";
import CirclePart from "./primitives/CirclePart";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import {
  GAP_JOINER_SOCKET_DETECTION_OPACITY_RATE,
  GAP_JOINER_SOCKET_FILL_COLORS,
  GAP_JOINER_SOCKET_HIT_RADIUS
} from "constants/parts";
import getLogger from "logging";
import PartGroup from "components/rails/parts/primitives/PartGroup";

const LOGGER = getLogger(__filename)

interface GapJoinerSocketProps extends Partial<DefaultProps> {
  name?: string
  data?: any
  hasGapJoiner: boolean
  onMouseMove?: (e: MouseEvent) => void
  onLeftClick?: (e: MouseEvent) => boolean
  onRightClick?: (e: MouseEvent) => boolean
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
}

interface DefaultProps {
  position?: Point2D
  angle?: number
  pivot?: Pivot
  selected?: boolean
  opacity?: number
  visible?: boolean
  fillColors?: string[]
  hasGapJoiner?: boolean
  detectionEnabled?: boolean
}


export default class GapJoinerSocket extends React.Component<GapJoinerSocketProps, {}> {
  public static defaultProps: DefaultProps = {
    position: {x: 0, y: 0},
    angle: 0,
    pivot: Pivot.CENTER,
    selected: false,
    opacity: 1,
    visible: true,
    fillColors: GAP_JOINER_SOCKET_FILL_COLORS,
    hasGapJoiner: false,
    detectionEnabled: true
  }

  part: DetectablePart

  constructor(props: GapJoinerSocketProps) {
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
    const {
      position, angle, detectionEnabled, hasGapJoiner, pivot, selected, fillColors, opacity, visible,
      name, data, onLeftClick, onRightClick, onMouseMove, onMouseEnter, onMouseLeave
    } = this.props

    return (
      <DetectablePart
        mainPart={
          <CirclePart
            radius={0}
          />
        }
        detectionPart={
          <PartGroup
            pivotPartIndex={0}
          >
            <CirclePart
              radius={GAP_JOINER_SOCKET_HIT_RADIUS}
              opacity={opacity * GAP_JOINER_SOCKET_DETECTION_OPACITY_RATE}
            />
          </PartGroup>
        }
        position={{x: position.x, y: position.y}}
        angle={angle}
        pivot={pivot}
        fillColors={fillColors}
        visible={visible}
        selected={selected}
        detectionEnabled={detectionEnabled && ! hasGapJoiner}
        pivotPartIndex={0}
        name={name}
        data={data}
        onLeftClick={onLeftClick}
        onRightClick={onRightClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        ref={(part) => {
          if (part) this.part = part
        }}
      />
    )
  }
}
