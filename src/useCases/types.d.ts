import {ProjectUseCase} from "./projectUseCase";
import {SelectionToolUseCase} from "./selectionToolUseCase";
import {PowerPackUseCase} from "./powerPackUseCase";
import {SwitcherUseCase} from "./switcherUseCase";
import {GapJoinerUseCase} from "./gapJoinerUseCase";
import {FeederUseCase} from "./feederUseCase";
import {BuilderUseCase} from "./builderUseCase";
import {RailToolUseCase} from "./railToolUseCase";
import {LayerUseCase} from "./layerUseCase";
import {SimulationUseCase} from "./simulationUseCase";
import {JointInfo} from "react-rail-components";

export type WithProjectUseCase = {
  projectUseCase?: ProjectUseCase
}

export type WithSelectionToolUseCase = {
  selectionToolUseCase?: SelectionToolUseCase
}

export type WithPowerPackUseCase = {
  powerPackUseCase?: PowerPackUseCase
}

export type WithSwitcherUseCase = {
  switcherUseCase?: SwitcherUseCase
}

export type WithGapJoinerUseCase = {
  gapJoinerUseCase?: GapJoinerUseCase
}

export type WithFeeerUseCase = {
  feederUseCase?: FeederUseCase
}

export type WithBuilderUseCase = {
  builderUseCase?: BuilderUseCase
}

export type WithRailToolUseCase = {
  railToolUseCase?: RailToolUseCase
}

export type WithLayerUseCase = {
  layerUseCase?: LayerUseCase
}

export type WithSimulationUseCase = {
  simulationUseCase?: SimulationUseCase
}

export interface JointPair {
  from: JointInfo
  to: JointInfo
}

