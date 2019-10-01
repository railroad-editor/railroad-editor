import {LayoutStore, PowerPackData} from "stores/layoutStore";
import {action} from "mobx";
import {FlowDirection} from "react-rail-components/lib/parts/primitives/PartBase";
import TrainController from "containers/Editor/ToolBar/SimulatorToolBar/TrainController";
import simulatorStore, {SandboxStore} from "stores/sandboxStore";


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
  private sandboxStore: SandboxStore

  constructor(layoutStore: LayoutStore, sandboxStore: SandboxStore) {
    this.layoutStore = layoutStore
    this.sandboxStore = sandboxStore
  }

  @action
  addPowerPack = (item: PowerPackData) => {
    this.layoutStore.addPowerPack(item)
    // コントローラー側も初期化
    TrainController.setPowerPackDirection(item.id, item.direction)
    TrainController.setPowerPackValue(item.id, item.power)
  }

  @action
  updatePowerPack = (item: Partial<PowerPackData>) => {
    const before = this.layoutStore.getPowerPackById(item.id)
    this.layoutStore.updatePowerPack(item)
    const after = this.layoutStore.getPowerPackById(item.id)

    if (before.direction !== after.direction) {
      item.power = 0
      TrainController.setPowerPackDirection(item.id, item.direction)
      if (simulatorStore.sandbox) {
        simulatorStore.sandbox.setPowerPackDirection(item.id, item.direction)
      }
    }
    if (before.power !== after.power) {
      TrainController.setPowerPackValue(item.id, item.power)
      if (simulatorStore.sandbox) {
        simulatorStore.sandbox.setPowerPackPower(item.id, item.power)
      }
    }
  }

  @action
  updatePowerPacks = (items: Partial<PowerPackData>[]) => {
    items.forEach(item => this.updatePowerPack(item))
  }

  @action
  deletePowerPack = (item: Partial<PowerPackData>) => {
    this.layoutStore.deletePowerPack(item)
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