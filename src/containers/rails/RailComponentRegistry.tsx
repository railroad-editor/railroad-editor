import RailContainers, {RailData, RailGroupData} from "containers/rails";
import {LayerData} from "stores/layoutStore";
import {FeederInfo, GapJoinerInfo, RailBase, RailBaseProps, RailGroup} from "react-rail-components";
import * as React from "react";
import getLogger from "logging";
import {WithRailBaseProps} from "containers/rails/withRailBase";

const LOGGER = getLogger(__filename)

export class RailComponentRegistry {

  rails: Array<RailBase<RailBaseProps & WithRailBaseProps, any>> = []
  railGroups: Array<any> = []

  createRail = (item: RailData, layer?: LayerData, feeders?: FeederInfo[], gapJoiners?: GapJoinerInfo[]) => {
    const {id, type, ...props} = item
    let RailContainer = RailContainers[type]
    if (RailContainer == null) {
      throw Error(`'${type}' is not a valid Rail type!`)
    }

    const onMount = (ref) => {
      this.rails[ref.props.id] = ref
      LOGGER.info(`Rail added. id=${ref.props.id}, ${ref.props.type}`)  //`
    }
    const onUnmount = (ref) => {
      LOGGER.info(`Rail deleted. id=${ref.props.id}, ${ref.props.type}`)  //`
      delete this.rails[ref.props.id]
    }

    return (
      <RailContainer
        key={`rail-container-${id}`}
        id={id}
        {...props}
        fillColor={layer.color}
        opacity={layer.opacity || props.opacity}    // Layerの設定を優先する
        visible={layer.visible || props.visible}    // 同上
        // data={{ id: id, type: Type }}
        // (activeTool === Tools.SELECT)
        // (this.props.selectedItem.id === selectedItem || layer.id === selectedItem)
        // HOCでラップされた中身のRailComponentを取得する
        onMount={onMount}
        onUnmount={onUnmount}
        feeders={feeders}
        gapJoiners={gapJoiners}
      />)
  }

  createRailGroup = (item: RailGroupData, children: RailData[], layer: LayerData) => {
    const {id, type, ...props} = item
    if (type !== 'RailGroup') {
      throw Error(`'${type}' is not a RailGroup!`)
    }

    const onMount = (ref) => {
      this.railGroups[id] = ref
      LOGGER.info(`RailGroup added. id=${id}, ${ref.props.type}`)  //`
    }
    const onUnmount = (ref) => {
      LOGGER.info(`RailGroup deleted. id=${id}, ${ref.props.type}`)  //`
      delete this.railGroups[id]
    }

    return (
      <RailContainers.RailGroup
        key={id}
        id={id}
        {...props}
        onMount={onMount}
        onUnmount={onUnmount}
      >
        {children.map(rail => this.createRail(rail, layer))}
      </RailContainers.RailGroup>
    )
  }

  getRailById = (id: number): RailBase<RailBaseProps & WithRailBaseProps, any> => {
    return this.rails[id]
  }

  getRailGroupById = (id: number): RailGroup => {
    return this.railGroups[id]
  }
}

export default new RailComponentRegistry()