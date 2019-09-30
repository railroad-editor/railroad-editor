import {action} from "mobx";
import {LayoutStore} from "../store/layoutStore";
import {FeederInfo} from "react-rail-components";
import {PowerPackUseCase} from "./powerPackUseCase";


export class FeederUseCase {

  private layoutStore: LayoutStore
  private powerPackUseCase: PowerPackUseCase

  constructor(layoutStore: LayoutStore, powerPackUseCase: PowerPackUseCase) {
    this.layoutStore = layoutStore
    this.powerPackUseCase = powerPackUseCase
  }

  @action
  addFeeder = (item: FeederInfo) => {
    this.layoutStore.addFeeder(item)
  }

  @action
  updateFeeder = (item: Partial<FeederInfo>) => {
    this.layoutStore.updateFeeder(item)
  }

  @action
  deleteFeeder = (feederId: number) => {
    this.powerPackUseCase.disconnectFeederFromPowerPack(feederId)
    this.layoutStore.deleteFeeder({id: feederId})
  }

  @action
  deleteSelectedFeeders = () => {
    const feederIds = this.layoutStore.currentLayoutData.feeders
      .filter(feeder => feeder.selected)
      .map(feeder => feeder.id)
    feederIds.forEach(id => {
      this.powerPackUseCase.disconnectFeederFromPowerPack(id)
      this.layoutStore.deleteFeeder({id})
    })
  }
}