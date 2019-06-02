import * as React from "react";
import {Pivot} from "components/rails/parts/primitives/PartBase";
import {GAP_JOINER_HEIGHT, GAP_JOINER_SOCKET_FILL_COLORS, GAP_JOINER_WIDTH} from "constants/parts";
import RectPart from "components/rails/parts/primitives/RectPart";
import getLogger from "logging";

const LOGGER = getLogger(__filename)

interface GapJoinerProps extends Partial<DefaultProps> {
  id: number
}

interface DefaultProps {
  position?: Point2D
  angle?: number
  data?: any
  pivot?: Pivot
  selected?: boolean
  opacity?: number
  visible?: boolean
  fillColor?: string
  onLeftClick?: (e: MouseEvent) => boolean
  onMouseEnter?: (e: MouseEvent) => void
  onMouseLeave?: (e: MouseEvent) => void
}


export default class GapJoiner extends React.Component<GapJoinerProps, {}> {
  public static defaultProps: DefaultProps = {
    position: {x: 0, y: 0},
    angle: 0,
    pivot: Pivot.CENTER,
    selected: false,
    opacity: 1,
    visible: true,
    fillColor: GAP_JOINER_SOCKET_FILL_COLORS[0],
  }

  part: RectPart

  constructor(props: GapJoinerProps) {
    super(props)
  }

  get path() {
    return this.part.path
  }

  render() {
    const {position, angle, pivot, fillColor, opacity, visible, selected, data, onLeftClick, onMouseEnter, onMouseLeave} = this.props

    return (
      <RectPart
        position={{x: position.x, y: position.y}}
        angle={angle}
        width={GAP_JOINER_WIDTH}
        height={GAP_JOINER_HEIGHT}
        fillColor={fillColor}
        opacity={opacity}
        pivot={Pivot.CENTER}
        visible={visible}
        selected={selected}
        data={data}
        onLeftClick={onLeftClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        ref={(r) => {
          if (r) this.part = r
        }}
      />
    )
  }
}

