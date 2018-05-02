import CommonStore from "store/commonStore";
import BuilderStore from "store/builderStore";
import LayoutStore from "store/layoutStore";

export function createStores() {
  return {
    common: CommonStore,
    builder: BuilderStore,
    layout: LayoutStore
  };
}
