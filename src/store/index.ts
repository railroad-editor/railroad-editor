import CommonStore from "store/commonStore";
import BuilderStore from "store/builderStore";
import LayoutStore from "store/layoutStore";
import UiStore from "store/uiStore";
import LayoutLogicStore from "store/layoutLogicStore";
import SimulatorLogicStore from "store/simulatorLogicStore";
import PaperStore from "./paperStore.";
import SimulatorStore from "./simulatorStore";

export default () => {
  return {
    common: CommonStore,
    builder: BuilderStore,
    layout: LayoutStore,
    layoutLogic: LayoutLogicStore,
    simulator: SimulatorStore,
    simulatorLogic: SimulatorLogicStore,
    ui: UiStore,
    paper: PaperStore
  };
}
