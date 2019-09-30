import {ConductionStates, LayoutStore} from "store/layoutStore";
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

export class SwitcherUseCase {
  private layoutStore: LayoutStore

  constructor(layoutStore: LayoutStore) {
    this.layoutStore = layoutStore
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

    this.layoutStore.updateSwitcher({
      id: switcherId,
      conductionStates: newConductionStates
    })
  }

  @action
  disconnectTurnoutFromSwitcher = (railId: number) => {
    const target = this.layoutStore.getSwitcherByRailId(railId)
    if (target == null) {
      return
    }

    let newConductionStates = {}
    _.keys(target.conductionStates).forEach(idx => {
      newConductionStates[idx] = target.conductionStates[idx].filter(state => state.railId !== railId)
    })

    this.layoutStore.updateSwitcher({
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
      this.layoutStore.updateRail({
        id: s.railId,
        conductionState: s.conductionState
      })
    })

    // Switcherの状態更新
    this.layoutStore.updateSwitcher({
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
      this.layoutStore.updateRail({
        id: s.railId,
        conductionState: s.conductionState
      })
    })

    // Switcherの状態更新
    this.layoutStore.updateSwitcher({
      id: switcherId,
      conductionStates: conductionStates
    })
  }

  private getSwitcherById = (id: number) => {
    return this.layoutStore.currentLayoutData.switchers.find(p => p.id === id)
  }
}