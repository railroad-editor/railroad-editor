import CommonStore from "store/commonStore";
import BuilderStore from "store/builderStore";
import LayoutStore from "store/layoutStore";
import UiStore from "store/uiStore";

export function createStores() {
  return {
    common: CommonStore,
    builder: BuilderStore,
    layout: LayoutStore,
    ui: UiStore
  };
}
