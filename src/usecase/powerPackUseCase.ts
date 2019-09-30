import {LayoutStore} from "../store/layoutStore";
import {action} from "mobx";
import {FlowDirection} from "react-rail-components/lib/parts/primitives/PartBase";


export interface TemporaryFlowDirection {
  feederId: number
  direction: FlowDirection
}

export interface TemporaryRailPartFlows {
  [partId: number]: TemporaryFlowDirection[]
}

export interface TemporaryRailFlows {
  [railId: number]: TemporaryRailPartFlows
}

export class PowerPackUseCase {
  private layoutStore: LayoutStore

  constructor(layoutStore: LayoutStore) {
    this.layoutStore = layoutStore
  }

  @action
  connectFeederToPowerPack = (feederId: number, powerPackId: number) => {
    const target = this.getPowerPackById(powerPackId)
    if (target == null) {
      return
    }

    if (target.supplyingFeederIds.includes(feederId)) {
      return
    }

    this.disconnectFeederFromPowerPack(feederId)

    this.layoutStore.updatePowerPack({
      id: target.id,
      supplyingFeederIds: [...target.supplyingFeederIds, feederId]
    })
  }

  @action
  disconnectFeederFromPowerPack = (feederId: number) => {
    const target = this.layoutStore.currentLayoutData.powerPacks.find(p => p.supplyingFeederIds.includes(feederId))
    if (target == null) {
      return
    }

    if (! target.supplyingFeederIds.includes(feederId)) {
      return
    }

    const newFeederIds = target.supplyingFeederIds.filter(id => id !== feederId)
    this.layoutStore.updatePowerPack({
      id: target.id,
      supplyingFeederIds: newFeederIds
    })
  }

  private getPowerPackById = (id: number) => {
    return this.layoutStore.currentLayoutData.powerPacks.find(p => p.id === id)
  }
}