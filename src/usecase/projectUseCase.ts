import {action} from "mobx";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore, PlacingMode} from "store/builderStore";
import StorageAPI from "apis/storage"
import LayoutAPI from "apis/layout";
import moment from "moment";
import {EditorMode, EditorStore} from "../store/editorStore";
import {SimulationUseCase} from "./simulationUseCase";


export class ProjectUseCase {

  private layoutStore: LayoutStore
  private builderStore: BuilderStore
  private editorStore: EditorStore
  private simulationUseCase: SimulationUseCase

  constructor(layoutStore: LayoutStore, builderStore: BuilderStore, editorStore: EditorStore, simulationUseCase: SimulationUseCase) {
    this.layoutStore = layoutStore
    this.builderStore = builderStore
    this.editorStore = editorStore
    this.simulationUseCase = simulationUseCase
  }

  @action
  saveLayout = async () => {

    const userId = this.editorStore.userInfo.id
    // メタデータを更新
    this.layoutStore.setLayoutMeta({
      ...this.layoutStore.meta,
      lastModified: moment().valueOf()
    })
    // レイアウトデータをセーブ
    LayoutAPI.saveLayoutData(
      this.editorStore.currentUser,
      this.layoutStore.currentLayoutData,
      this.layoutStore.meta,
      this.layoutStore.config,
      this.builderStore.userRailGroups,
      this.builderStore.userRails
    )
    // レイアウト画像をセーブ
    await StorageAPI.saveCurrentLayoutImage(userId, this.layoutStore.meta.id)
    // 背景画像が設定されていたらセーブ
    if (this.layoutStore.config.backgroundImageUrl) {
      await StorageAPI.saveBackgroundImage(userId, this.layoutStore.meta.id, this.layoutStore.config.backgroundImageUrl)
    }

    await this.loadLayoutList()
  }

  @action
  loadLayout = async (layoutId: string) => {
    const layout = await LayoutAPI.fetchLayoutData(this.editorStore.currentUser, layoutId)
    this.layoutStore.setLayoutData(layout.layout)
    this.layoutStore.setLayoutMeta(layout.meta)
    this.layoutStore.setConfig(layout.config)
    this.builderStore.setUserRailGroups(layout.userRailGroups)
    this.builderStore.setUserRails(layout.userRails)
    if (layout.layout.rails.length > 0) {
      this.builderStore.setPlacingMode(PlacingMode.JOINT)
    } else {
      this.builderStore.setPlacingMode(PlacingMode.FREE)
    }

    // TODO: 本当はセーブするときに全ての電流をOFFにしておくのが良い
    if (this.editorStore.mode === EditorMode.BUILDER) {
      this.simulationUseCase.stop()
    }
  }

  @action
  loadLayoutList = async () => {
    const layouts = await LayoutAPI.fetchLayoutList(this.editorStore.currentUser)
    this.editorStore.setLayoutList(layouts)
  }
}

