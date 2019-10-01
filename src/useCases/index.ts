import {BuilderUseCase} from "./builderUseCase";
import {LayerUseCase} from "./layerUseCase";
import {RailToolUseCase} from "./railToolUseCase";
import {ProjectUseCase} from "./projectUseCase";
import {SelectionToolUseCase} from "./selectionToolUseCase";
import {FeederUseCase} from "./feederUseCase";
import {PowerPackUseCase} from "./powerPackUseCase";
import {GapJoinerUseCase} from "./gapJoinerUseCase";
import {SwitcherUseCase} from "./switcherUseCase";
import {SimulationUseCase} from "./simulationUseCase";
import layoutStore from "../stores/layoutStore";
import builderStore from "../stores/builderStore";
import editorStore from "../stores/editorStore";
import layerPaletteStore from "../stores/layerPaletteStore";
import uiStore from "../stores/uiStore";
import sandboxStore from "stores/sandboxStore";

export * from "./types.d";

export type AppUseCases = {
  projectUseCase: ProjectUseCase
  selectionToolUseCase: SelectionToolUseCase
  powerPackUseCase: PowerPackUseCase
  switcherUseCase: SwitcherUseCase
  gapJoinerUseCase: GapJoinerUseCase
  feederUseCase: FeederUseCase
  builderUseCase: BuilderUseCase
  railToolUseCase: RailToolUseCase
  layerUseCase: LayerUseCase
  simulationUseCase: SimulationUseCase
}


export default (): AppUseCases => {

  const selectionToolUseCase = new SelectionToolUseCase(layoutStore, builderStore)
  const powerPackUseCase = new PowerPackUseCase(layoutStore, sandboxStore)
  const switcherUseCase = new SwitcherUseCase(layoutStore)
  const gapJoinerUseCase = new GapJoinerUseCase(layoutStore)
  const simulationUseCase = new SimulationUseCase(editorStore, layoutStore, powerPackUseCase)

  const projectUseCase = new ProjectUseCase(layoutStore, builderStore, editorStore, simulationUseCase)
  const feederUseCase = new FeederUseCase(layoutStore, powerPackUseCase)
  const builderUseCase = new BuilderUseCase(editorStore, builderStore, selectionToolUseCase, simulationUseCase)
  const railToolUseCase = new RailToolUseCase(layoutStore, builderStore, layerPaletteStore, uiStore, feederUseCase, gapJoinerUseCase, switcherUseCase, selectionToolUseCase)
  const layerUseCase = new LayerUseCase(layoutStore, layerPaletteStore, railToolUseCase)

  return {
    projectUseCase,
    selectionToolUseCase,
    powerPackUseCase,
    switcherUseCase,
    gapJoinerUseCase,
    feederUseCase,
    builderUseCase,
    railToolUseCase,
    layerUseCase,
    simulationUseCase,
  };
}
