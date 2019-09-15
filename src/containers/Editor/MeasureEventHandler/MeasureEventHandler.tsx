import * as React from "react";
import getLogger from "logging";
import {inject, observer} from "mobx-react";
import {STORE_LAYOUT, STORE_MEASURE} from "constants/stores";
import {LayoutStore} from "../../../store/layoutStore";
import {Layer} from "react-paper-bindings";
import {Point} from "paper";
import {runInAction} from "mobx";
import RectPart from "react-rail-components/lib/parts/primitives/RectPart";
import {MeasureStore} from "../../../store/measureStore";

const LOGGER = getLogger(__filename)

export interface MeasureEventHandlerProps {
  mousePosition: Point2D
  active: boolean
  layout?: LayoutStore
  measure?: MeasureStore
}

export interface MeasureEventHandlerState {
}


@inject(STORE_LAYOUT, STORE_MEASURE)
@observer
export class MeasureEventHandler extends React.Component<MeasureEventHandlerProps, MeasureEventHandlerState> {

  constructor(props: MeasureEventHandlerProps) {
    super(props)
    this.state = {}
  }

  onLeftClick = (e: MouseEvent) => {
    if (this.props.active) {
      this.onLeftClickForMeasureTool(e)
    }
  }

  onRightClick = (e: MouseEvent) => {
    if (this.props.active) {
      this.onRightClickForMeasureTool(e)
    }
  }


  onLeftClickForMeasureTool = (e: MouseEvent) => {
    const start = this.props.measure.startPosition
    const end = this.props.measure.endPosition
    if (! start && ! end || start && end) {
      this.props.measure.setEndPosition(null)
      this.props.measure.setStartPosition(this.props.mousePosition)
    }
    if (start && ! end) {
      this.props.measure.setEndPosition(this.props.mousePosition)
    }
  }

  onRightClickForMeasureTool = (e: MouseEvent) => {
    runInAction(() => {
      this.props.measure.setStartPosition(null)
      this.props.measure.setEndPosition(null)
    })
  }

  render() {
    return (
      <Layer name={'lowestEventHandler'}>
        <RectPart
          width={this.props.layout.config.paperHeight}
          height={this.props.layout.config.paperWidth}
          position={new Point(this.props.layout.config.paperWidth / 2, this.props.layout.config.paperHeight / 2)}
          opacity={0}
          fillColor={'yellow'}
          onLeftClick={this.onLeftClick}
          onRightClick={this.onRightClick}
        />
      </Layer>
    )
  }
}

