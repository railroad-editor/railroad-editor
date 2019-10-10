import {action, reaction, runInAction} from "mobx";
import {BuilderStore} from "stores/builderStore";
import {Tools} from "constants/tools";
import measureToolStore from "../stores/measureStore";
import {EditorMode, EditorStore} from "stores/editorStore";
import {SelectionToolUseCase} from "./selectionToolUseCase";
import {SimulationUseCase} from "./simulationUseCase";
import {LayoutStore} from "stores/layoutStore";


export class BuilderUseCase {

  private readonly editorStore: EditorStore
  private readonly layoutStore: LayoutStore
  private readonly builderStore: BuilderStore
  private readonly selectionToolUseCase: SelectionToolUseCase
  private readonly simulationUseCase: SimulationUseCase

  constructor(editorStore: EditorStore, layoutStore: LayoutStore, builderStore: BuilderStore, selectionToolUseCase: SelectionToolUseCase, simulationUseCase: SimulationUseCase) {
    this.editorStore = editorStore
    this.layoutStore = layoutStore
    this.builderStore = builderStore
    this.selectionToolUseCase = selectionToolUseCase
    this.simulationUseCase = simulationUseCase

    // ツール変更時
    reaction(
      () => this.builderStore.activeTool,
      (tool) => {
        this.changeMode(tool)
      }
    )

    // モード変更時に各モードの状態を復元する
    reaction(
      () => this.editorStore.mode,
      (mode) => {
        switch (mode) {
          case EditorMode.BUILDER:
            this.changeMode(builderStore.activeTool)
            this.simulationUseCase.stop()
            break
          case EditorMode.SIMULATOR:
            this.layoutStore.disableAllDetectables()
            this.simulationUseCase.start()
            break
        }
      }
    )
  }


  @action
  changeToFeederMode = () => {
    this.layoutStore.enableFeederSockets()
    this.selectionToolUseCase.selectAllRails(false)
    this.selectionToolUseCase.selectAllGapJoiners(false)
  }

  @action
  changeToGapJoinerMode = () => {
    this.layoutStore.enableGapsJoinerSockets()
    this.selectionToolUseCase.selectAllRails(false)
    this.selectionToolUseCase.selectAllFeeders(false)
  }

  @action
  changeToRailMode = () => {
    this.layoutStore.enableJoints()
    this.selectionToolUseCase.selectAllFeeders(false)
    this.selectionToolUseCase.selectAllGapJoiners(false)
  }

  @action
  changeToSimulationMode = () => {
    this.layoutStore.disableAllDetectables()
    this.selectionToolUseCase.selectAllRails(false)
    this.selectionToolUseCase.selectAllFeeders(false)
    this.selectionToolUseCase.selectAllGapJoiners(false)
  }

  @action
  changeMode = (tool: Tools) => {
    this.builderStore.setCursorShape(tool)
    switch (tool) {
      case Tools.FEEDERS:
        this.changeToFeederMode()
        break
      case Tools.GAP_JOINERS:
        this.changeToGapJoinerMode()
        break
      case Tools.MEASURE:
        runInAction(() => {
          measureToolStore.setStartPosition(null)
          measureToolStore.setEndPosition(null)
        })
        break
      default:
        this.changeToRailMode()
        break
    }
  }
}

