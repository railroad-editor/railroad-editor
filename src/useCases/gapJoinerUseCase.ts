import {action} from "mobx";
import {LayoutStore} from "stores/layoutStore";
import {GapJoinerInfo} from "react-rail-components";


export class GapJoinerUseCase {

  private layoutStore: LayoutStore

  constructor(layoutStore: LayoutStore) {
    this.layoutStore = layoutStore
  }

  @action
  addGapJoiner = (item: GapJoinerInfo) => {
    this.layoutStore.addGapJoiner(item)
  }

  @action
  updateGapJoiner = (item: Partial<GapJoinerInfo>) => {
    this.layoutStore.updateGapJoiner(item)
  }

  @action
  deleteGapJoiner = (item: Partial<GapJoinerInfo>) => {
    this.deleteGapJoiner(item)
  }

  @action
  disconnectGapJoiner = (railId: number) => {
    const target = this.layoutStore.getRailDataById(railId)

    // 自分のギャップジョイナーを削除する
    this.layoutStore.currentLayoutData.gapJoiners
      .filter(gapJoiner => gapJoiner.railId === railId)
      .forEach(gapJoiner => this.layoutStore.deleteGapJoiner(gapJoiner))

    // 対向ジョイントにギャップジョイナーが存在したら削除する
    _.values(target.opposingJoints).forEach(joint => {
      const opposingGapJoiner = this.layoutStore.currentLayoutData.gapJoiners
        .find(gapJoiner => gapJoiner.railId === joint.railId && gapJoiner.jointId === joint.jointId)
      if (opposingGapJoiner) {
        this.layoutStore.deleteGapJoiner(opposingGapJoiner)
      }
    })
  }

  @action
  deleteSelectedGapJoiners = () => {
    const gapJoinerIds = this.layoutStore.currentLayoutData.gapJoiners
      .filter(gapJoiner => gapJoiner.selected)
      .map(gapJoiner => gapJoiner.id)
    gapJoinerIds.forEach(id => this.layoutStore.deleteGapJoiner({id}))
  }

}