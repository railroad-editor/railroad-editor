import {action} from "mobx";
import {LayoutStore} from "stores/layoutStore";
import {Tools} from "constants/tools";
import {BuilderStore} from "stores/builderStore";


export class SelectionToolUseCase {

  private readonly layoutStore: LayoutStore
  private readonly builderStore: BuilderStore

  constructor(layoutStore: LayoutStore, builderStore: BuilderStore) {
    this.layoutStore = layoutStore
    this.builderStore = builderStore
  }


  @action
  toggleRail = (railId: number) => {
    const target = this.layoutStore.getRailDataById(railId)
    if (target == null) {
      return
    }

    this.layoutStore.updateRail({
      id: target.id,
      selected: ! target.selected,
    })
  }

  @action
  selectRail = (railId: number, selected: boolean) => {
    const target = this.layoutStore.getRailDataById(railId)
    if (target == null) {
      return
    }
    if (target.selected === selected) {
      return
    }

    this.layoutStore.updateRail({
      id: target.id,
      selected: selected
    })
  }

  @action
  selectRails = (railIds: number[], selected: boolean) => {
    railIds.forEach(railId => this.selectRail(railId, selected))
  }

  @action
  selectAllRails = (selected: boolean) => {
    const railIds = this.layoutStore.currentLayoutData.rails.map(rail => rail.id)
    this.selectRails(railIds, selected)
  }

  @action
  toggleSelectRail = (railId: number) => {
    const target = this.layoutStore.getRailDataById(railId)
    if (target == null) {
      return
    }
    this.selectAllRails(false)
    this.selectRail(railId, ! target.selected)
  }


  @action
  selectFeeder = (feederId: number, selected: boolean) => {
    const target = this.layoutStore.getFeederDataById(feederId)
    if (target == null) {
      return
    }
    this.layoutStore.updateFeeder({
      id: target.id,
      selected: selected
    })
  }

  @action
  selectFeeders = (feederIds: number[], selected: boolean) => {
    feederIds.forEach(feederId => this.selectFeeder(feederId, selected))
  }

  @action
  selectAllFeeders = (selected: boolean) => {
    const feederIds = this.layoutStore.currentLayoutData.feeders.map(rail => rail.id)
    this.selectFeeders(feederIds, selected)
  }

  @action
  toggleSelectFeeder = (feederId: number) => {
    const target = this.layoutStore.getFeederDataById(feederId)
    if (target == null) {
      return
    }
    this.selectAllFeeders(false)
    this.selectFeeder(feederId, ! target.selected)
  }

  @action
  selectGapJoiner = (gapJoinerId: number, selected: boolean) => {
    const target = this.layoutStore.getGapJoinerDataById(gapJoinerId)
    if (target == null) {
      return
    }
    this.layoutStore.updateGapJoiner({
      id: target.id,
      selected: selected
    })
  }

  @action
  selectGapJoiners = (gapJoinerIds: number[], selected: boolean) => {
    gapJoinerIds.forEach(gapJoinerId => this.selectGapJoiner(gapJoinerId, selected))
  }

  @action
  selectAllGapJoiners = (selected: boolean) => {
    const gapJoinerIds = this.layoutStore.currentLayoutData.gapJoiners.map(rail => rail.id)
    this.selectGapJoiners(gapJoinerIds, selected)
  }

  @action
  toggleSelectGapJoiner = (gapJoinerId: number) => {
    const target = this.layoutStore.getGapJoinerDataById(gapJoinerId)
    if (target == null) {
      return
    }
    this.selectAllGapJoiners(false)
    this.selectGapJoiner(gapJoinerId, ! target.selected)
  }

  @action
  selectAll = (selected: boolean) => {
    switch (this.builderStore.activeTool) {
      case Tools.FEEDERS:
        this.selectAllFeeders(selected)
        break
      case Tools.GAP_JOINERS:
        this.selectAllGapJoiners(selected)
        break
      default:
        this.selectAllRails(selected)
        break
    }
  }
}