import BuilderStore, {BuilderStoreState} from "store/builderStore";
import LayoutStore, {LayoutStoreState} from "store/layoutStore";
import UiStore from "store/uiStore";
import LayoutLogicStore from "store/layoutLogicStore";
import SimulatorLogicStore from "store/simulatorLogicStore";
import SimulatorStore from "./simulatorStore";
import FreeRailPlacerStore, {FreeRailPlacerStoreState} from "./freeRailPlacerStore";
import MeasureStore, {MeasureStoreState} from "./measureStore";
import EditorStore from "./editorStore";

export interface AppState {
  builder: BuilderStoreState
  freeRailPlacer: FreeRailPlacerStoreState
  measure: MeasureStoreState
  layout: LayoutStoreState
}

export default () => {
  return {
    editor: EditorStore,
    builder: BuilderStore,
    freeRailPlacer: FreeRailPlacerStore,
    measure: MeasureStore,
    layout: LayoutStore,
    layoutLogic: LayoutLogicStore,
    simulator: SimulatorStore,
    simulatorLogic: SimulatorLogicStore,
    ui: UiStore,
  };
}
