import * as React from "react";
import {Point} from "paper";
import {Rectangle} from "react-paper-bindings";
import DetectablePart from "./primitives/DetectablePart";
import getLogger from "logging";
import TrianglePart from "components/rails/parts/primitives/TrianglePart";
import {FEEDER_HEIGHT, FEEDER_SOCKET_FILL_COLORS, FEEDER_WIDTH} from "constants/parts";
import {FlowDirection, Pivot} from "components/rails/parts/primitives/PartBase";

const LOGGER = getLogger(__filename)

interface FeederProps extends Partial<DefaultProps> {
  id: number
  onLeftClick?: (e: MouseEvent) => boolean
}

interface DefaultProps {
  position?: Point
  angle?: number
  data?: any
  selected?: boolean
  opacity?: number
  visible?: boolean
  fillColor?: string
  direction?: FlowDirection
}


export default class Feeder extends React.Component<FeederProps, {}> {
  public static defaultProps: DefaultProps = {
    position: new Point(0, 0),
    angle: 0,
    selected: false,
    opacity: 1,
    visible: true,
    fillColor: FEEDER_SOCKET_FILL_COLORS[0]
  }

  part: TrianglePart

  constructor(props: FeederProps) {
    super(props)
  }

  get path() {
    return this.part.path
  }

  getAngle = () => {
    const {angle, direction} = this.props
    switch (direction) {
      case FlowDirection.START_TO_END:
        return angle
      case FlowDirection.END_TO_START:
        return angle + 180
      default:
        return angle
    }
  }

  render() {
    const { position, opacity, fillColor, visible, selected, data, onLeftClick } = this.props
    const angle = this.getAngle()

    return (
      <TrianglePart
        position={position}
        angle={angle}
        width={FEEDER_WIDTH}
        height={FEEDER_HEIGHT}
        fillColor={fillColor}
        opacity={opacity}
        pivot={Pivot.TOP}
        visible={visible}
        selected={selected}
        data={data}
        onClick={onLeftClick}
        ref={(r) => {if (r) this.part = r}}
      />
    )
  }
}
