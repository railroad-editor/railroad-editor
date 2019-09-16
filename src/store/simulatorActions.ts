import {action} from "mobx";
import getLogger from "logging";
import layoutStore, {ConductionStates, LayoutStore} from "store/layoutStore";
import {FlowDirection} from "react-rail-components/lib/parts/primitives/PartBase";

const LOGGER = getLogger(__filename)


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


export class SimulatorActions {

  private layout: LayoutStore

  constructor(layout: LayoutStore) {
    this.layout = layout
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

    this.layout.updatePowerPack({
      id: target.id,
      supplyingFeederIds: [...target.supplyingFeederIds, feederId]
    })
  }

  @action
  disconnectFeederFromPowerPack = (feederId: number) => {
    const target = this.layout.currentLayoutData.powerPacks.find(p => p.supplyingFeederIds.includes(feederId))
    if (target == null) {
      return
    }

    if (! target.supplyingFeederIds.includes(feederId)) {
      return
    }

    const newFeederIds = target.supplyingFeederIds.filter(id => id !== feederId)
    this.layout.updatePowerPack({
      id: target.id,
      supplyingFeederIds: newFeederIds
    })
  }

  @action
  connectTurnoutToSwitcher = (railId: number, conductionStates: ConductionStates, switcherId: number) => {
    const target = this.getSwitcherById(switcherId)
    if (target == null) {
      return
    }

    this.disconnectTurnoutFromSwitcher(railId)

    const newConductionStates = target.conductionStates
    _.keys(conductionStates).forEach(idx => {
      newConductionStates[idx] = [...target.conductionStates[idx], ...conductionStates[idx]]
    })

    this.layout.updateSwitcher({
      id: switcherId,
      conductionStates: newConductionStates
    })
  }

  @action
  disconnectTurnoutFromSwitcher = (railId: number) => {
    const target = this.layout.getSwitcherByRailId(railId)
    if (target == null) {
      return
    }

    let newConductionStates = {}
    _.keys(target.conductionStates).forEach(idx => {
      newConductionStates[idx] = target.conductionStates[idx].filter(state => state.railId !== railId)
    })

    this.layout.updateSwitcher({
      id: target.id,
      conductionStates: newConductionStates
    })
  }

  @action
  changeSwitcherState = (switcherId: number, state: number) => {
    const target = this.getSwitcherById(switcherId)
    if (target == null) {
      return
    }

    // レールの状態更新
    target.conductionStates[state].forEach(s => {
      this.layout.updateRail({
        id: s.railId,
        conductionState: s.conductionState
      })
    })

    // Switcherの状態更新
    this.layout.updateSwitcher({
      id: switcherId,
      currentState: state
    })
  }

  @action
  changeSwitcherConductionTable = (switcherId: number, conductionStates: ConductionStates) => {
    const target = this.getSwitcherById(switcherId)
    if (target == null) {
      return
    }

    conductionStates[target.currentState].forEach(s => {
      this.layout.updateRail({
        id: s.railId,
        conductionState: s.conductionState
      })
    })

    // Switcherの状態更新
    this.layout.updateSwitcher({
      id: switcherId,
      conductionStates: conductionStates
    })
  }

  private getPowerPackById = (id: number) => {
    return this.layout.currentLayoutData.powerPacks.find(p => p.id === id)
  }

  private getSwitcherById = (id: number) => {
    return this.layout.currentLayoutData.switchers.find(p => p.id === id)
  }

}

export default new SimulatorActions(layoutStore)
