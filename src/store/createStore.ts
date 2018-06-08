import CommonStore from "store/commonStore";
import BuilderStore from "store/builderStore";
import LayoutStore from "store/layoutStore";
import UiStore from "store/uiStore";
import LayoutLogicStore from "store/layoutLogicStore";
import SimulatorLogicStore from "store/simulatorLogicStore";

export function createStores() {
  return {
    common: CommonStore,
    builder: BuilderStore,
    layout: LayoutStore,
    layoutLogic: LayoutLogicStore,
    simulatorLogic: SimulatorLogicStore,
    ui: UiStore
  };
}
