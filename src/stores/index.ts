import builderStore, {BuilderStore} from "stores/builderStore";
import layoutStore, {LayoutStore} from "stores/layoutStore";
import uiStore, {UiStore} from "stores/uiStore";
import sandboxStore, {SandboxStore} from "./sandboxStore";
import freeRailPlacerStore, {FreeRailPlacerStore} from "./freeRailPlacerStore";
import measureStore, {MeasureStore} from "./measureStore";
import editorStore, {EditorStore} from "./editorStore";
import layerPaletteStore, {LayerPaletteStore} from "./layerPaletteStore";

export * from "./types.d"

export type AppStores = {
  editor: EditorStore,
  builder: BuilderStore,
  freeRailPlacer: FreeRailPlacerStore,
  measure: MeasureStore,
  layout: LayoutStore,
  sandbox: SandboxStore,
  ui: UiStore,
  layerPalette: LayerPaletteStore
}


export default (): AppStores => {
  return {
    editor: editorStore,
    builder: builderStore,
    freeRailPlacer: freeRailPlacerStore,
    measure: measureStore,
    layout: layoutStore,
    sandbox: sandboxStore,
    ui: uiStore,
    layerPalette: layerPaletteStore,
  };
}
