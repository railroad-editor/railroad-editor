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
import layoutStore from "../store/layoutStore";
import builderStore from "../store/builderStore";
import editorStore from "../store/editorStore";
import layerPaletteStore from "../store/layerPaletteStore";

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
  const powerPackUseCase = new PowerPackUseCase(layoutStore)
  const switcherUseCase = new SwitcherUseCase(layoutStore)
  const gapJoinerUseCase = new GapJoinerUseCase(layoutStore)
  const simulationUseCase = new SimulationUseCase(editorStore, layoutStore)

  const projectUseCase = new ProjectUseCase(layoutStore, builderStore, editorStore, simulationUseCase)
  const feederUseCase = new FeederUseCase(layoutStore, powerPackUseCase)
  const builderUseCase = new BuilderUseCase(editorStore, builderStore, selectionToolUseCase, simulationUseCase)
  const railToolUseCase = new RailToolUseCase(layoutStore, builderStore, feederUseCase, gapJoinerUseCase, switcherUseCase, selectionToolUseCase)
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
