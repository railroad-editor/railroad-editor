import {JointInfo, RailGroupProps} from "react-rail-components";
import {RailData} from "containers/rails";
import {BuilderStore} from "./builderStore";
import {UiStore} from "./uiStore";
import {EditorStore} from "./editorStore";
import {LayoutStore} from "./layoutStore";
import {FreeRailPlacerStore} from "./freeRailPlacerStore";
import {MeasureStore} from "./measureStore";
import {LayerPaletteStore} from "./layerPaletteStore";
import {SandboxStore} from "./sandboxStore";

export type WithEditorStore = {
  editor?: EditorStore
}

export type WithBuilderStore = {
  builder?: BuilderStore
}

export type WithLayoutStore = {
  layout?: LayoutStore
}

export type WithFreeRailPlacerStore = {
  freeRailPlacer?: FreeRailPlacerStore
}

export type WithMeasureStore = {
  measure?: MeasureStore
}

export type WithUiStore = {
  ui?: UiStore
}

export type WithLayerPaletteStore = {
  layerPalette?: LayerPaletteStore
}

export type WithSandboxStore = {
  sandbox?: SandboxStore
}

declare interface PaletteItem {
  name: string
  type: string
}

declare interface PresetPaletteItemsByVendor {
  [key: string]: PresetPaletteItems
}

declare interface PresetPaletteItems {
  [key: string]: PaletteItem[]
}

declare interface LastPaletteItems {
  [key: string]: PaletteItem
}

declare interface UserRailGroupData extends RailGroupProps {
  // レールグループを構成するレール
  rails: RailData[]
  // レールグループで未接続のジョイント
  openJoints: JointInfo[]
}

