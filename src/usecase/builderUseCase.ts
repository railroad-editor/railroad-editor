import {action, reaction, runInAction} from "mobx";
import layoutStore from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import {Tools} from "constants/tools";
import measureToolStore from "../store/measureStore";
import {EditorMode, EditorStore} from "../store/editorStore";
import {SelectionToolUseCase} from "./selectionToolUseCase";
import {SimulationUseCase} from "./simulationUseCase";


export class BuilderUseCase {

  private readonly builderStore: BuilderStore
  private readonly editorStore: EditorStore
  private readonly selectionToolUseCase: SelectionToolUseCase
  private readonly simulationUseCase: SimulationUseCase

  constructor(editorStore: EditorStore, builderStore: BuilderStore, selectionToolUseCase: SelectionToolUseCase, simulationUseCase: SimulationUseCase) {
    this.editorStore = editorStore
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
            this.simulationUseCase.start()
            break
        }
      }
    )
  }


  @action
  changeToFeederMode = () => {
    layoutStore.enableFeederSockets()
    this.selectionToolUseCase.selectAllRails(false)
    this.selectionToolUseCase.selectAllGapJoiners(false)
  }

  @action
  changeToGapJoinerMode = () => {
    layoutStore.enableGapsJoinerSockets()
    this.selectionToolUseCase.selectAllRails(false)
    this.selectionToolUseCase.selectAllFeeders(false)
  }

  @action
  changeToRailMode = () => {
    layoutStore.enableJoints()
    this.selectionToolUseCase.selectAllFeeders(false)
    this.selectionToolUseCase.selectAllGapJoiners(false)
  }

  @action
  changeToSimulationMode = () => {
    layoutStore.disableAllDetectables()
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

