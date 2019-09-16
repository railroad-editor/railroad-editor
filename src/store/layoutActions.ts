import {action} from "mobx";
import layoutStore from "store/layoutStore";
import builderStore, {PlacingMode} from "store/builderStore";
import commonStore, {EditorMode} from "./editorStore";
import StorageAPI from "apis/storage"
import LayoutAPI from "apis/layout";
import moment from "moment";
import simulatorActions from "store/simulatorActions";


export class LayoutActions {

  @action
  saveLayout = async () => {

    const userId = commonStore.userInfo.id
    // メタデータを更新
    layoutStore.setLayoutMeta({
      ...layoutStore.meta,
      lastModified: moment().valueOf()
    })
    // レイアウトデータをセーブ
    LayoutAPI.saveLayoutData(
      commonStore.currentUser,
      layoutStore.currentLayoutData,
      layoutStore.meta,
      layoutStore.config,
      builderStore.userRailGroups,
      builderStore.userRails
    )
    // レイアウト画像をセーブ
    await StorageAPI.saveCurrentLayoutImage(userId, layoutStore.meta.id)
    // 背景画像が設定されていたらセーブ
    if (layoutStore.config.backgroundImageUrl) {
      await StorageAPI.saveBackgroundImage(userId, layoutStore.meta.id, layoutStore.config.backgroundImageUrl)
    }

    await commonStore.loadLayoutList()
  }

  @action
  loadLayout = async (layoutId: string) => {
    const layout = await LayoutAPI.fetchLayoutData(commonStore.currentUser, layoutId)
    layoutStore.setLayoutData(layout.layout)
    layoutStore.setLayoutMeta(layout.meta)
    layoutStore.setConfig(layout.config)
    builderStore.setUserRailGroups(layout.userRailGroups)
    builderStore.setUserRails(layout.userRails)
    if (layout.layout.rails.length > 0) {
      builderStore.setPlacingMode(PlacingMode.JOINT)
    } else {
      builderStore.setPlacingMode(PlacingMode.FREE)
    }

    // TODO: 本当はセーブするときに全ての電流をOFFにしておくのが良い
    if (commonStore.mode === EditorMode.BUILDER) {
      simulatorActions.stopCurrentFlowSimulation()
    }
  }
}

export default new LayoutActions()
