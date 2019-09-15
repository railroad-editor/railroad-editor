import * as React from "react";
import getLogger from "logging";
import {compose} from "recompose";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON, STORE_LAYOUT} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import {Tools} from "constants/tools";
import {CommonStore} from "store/commonStore";
import {LayoutStore} from "../../../store/layoutStore";
import {Layer} from "react-paper-bindings";
import {Point} from "paper";
import {runInAction} from "mobx";
import RectPart from "react-rail-components/lib/parts/primitives/RectPart";

const LOGGER = getLogger(__filename)

export interface LowestEventHandlingLayerProps {
  mousePosition: Point2D
  common?: CommonStore
  builder?: BuilderStore
  layout?: LayoutStore
}

export interface LowestEventHandlingLayerState {
}


@inject(STORE_COMMON, STORE_BUILDER, STORE_LAYOUT)
@observer
export class LowestEventHandler extends React.Component<LowestEventHandlingLayerProps, LowestEventHandlingLayerState> {

  constructor(props: LowestEventHandlingLayerProps) {
    super(props)
    this.state = {}
  }

  onLeftClick = (e: MouseEvent) => {
    if (this.props.builder.activeTool == Tools.MEASURE) {
      this.onLeftClickForMeasureTool(e)
    }
  }

  onRightClick = (e: MouseEvent) => {
    if (this.props.builder.activeTool == Tools.MEASURE) {
      this.onRightClickForMeasureTool(e)
    }
  }


  onLeftClickForMeasureTool = (e: MouseEvent) => {
    const start = this.props.builder.measureStartPosition
    const end = this.props.builder.measureEndPosition
    if (! start && ! end || start && end) {
      this.props.builder.setMeasureEndPosition(null)
      this.props.builder.setMeasureStartPosition(this.props.mousePosition)
    }
    if (start && ! end) {
      this.props.builder.setMeasureEndPosition(this.props.mousePosition)
    }
  }

  onRightClickForMeasureTool = (e: MouseEvent) => {
    runInAction('a', () => {
      this.props.builder.setMeasureStartPosition(null)
      this.props.builder.setMeasureEndPosition(null)
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

export default compose<LowestEventHandlingLayerProps, LowestEventHandlingLayerProps | any>(
)(LowestEventHandler)
