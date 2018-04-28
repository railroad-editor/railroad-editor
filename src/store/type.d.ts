/** TodoMVC model definitions **/
import {LayoutStoreState} from "reducers/layout";
import {BuilderStoreState} from "reducers/builder";
import {ToolsStoreState} from "reducers/tools";
import {SettingsStoreState} from "reducers/settings";


declare interface PaletteItem {
  name: string
  type: string
}

declare interface RootState {
  tools: ToolsStoreState
  layout: LayoutStoreState
  builder: BuilderStoreState
  settings: SettingsStoreState
}
