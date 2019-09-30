import * as React from 'react'
import {ToolEvent} from "paper";
import getLogger from "logging";
import {Tools} from "constants/tools";
import {inject, observer} from "mobx-react";
import {BuilderStore} from "store/builderStore";
import {LayoutStore} from "store/layoutStore";
import {UiStore} from "store/uiStore";
import {EditorStore} from "store/editorStore";
import {JointInfo} from "react-rail-components";
import {LayerPaletteStore} from "../../store/layerPaletteStore";
import {BuilderUseCase} from "../../usecase/builderUseCase";
import {RailToolUseCase} from "../../usecase/railToolUseCase";
import {ProjectUseCase} from "../../usecase/projectUseCase";
import {SelectionToolUseCase} from "../../usecase/selectionToolUseCase";
import {PaletteItem, STORE_BUILDER, STORE_EDITOR, STORE_LAYER_PALETTE, STORE_LAYOUT, STORE_UI} from "../../store";
import {USECASE_BUILDER, USECASE_PROJECT, USECASE_RAIL_TOOL, USECASE_SELECTION} from "../../usecase";


const LOGGER = getLogger(__filename)


export interface WithBuilderPublicProps {
  // builderMouseDown: (e: ToolEvent|any) => void
  // builderMouseMove: (e: ToolEvent|any) => void
  builderKeyDown: (e: ToolEvent | any) => void
  builderKeyUp: (e: ToolEvent | any) => void
}


interface WithBuilderPrivateProps {
  editor?: EditorStore
  builder?: BuilderStore
  layout?: LayoutStore
  layerPaletteStore?: LayerPaletteStore
  ui?: UiStore
  selectionToolUseCase?: SelectionToolUseCase
  builderUseCase?: BuilderUseCase
  railToolUseCase?: RailToolUseCase
  projectUseCase?: ProjectUseCase
}

export type WithBuilderProps = WithBuilderPublicProps & WithBuilderPrivateProps


export interface JointPair {
  from: JointInfo
  to: JointInfo
}


export interface WithBuilderState {
  newRailGroupDialogOpen: boolean
  deleteOnRegistered: boolean
}


/**
 * レールの設置に関連する機能を提供するHOC。
 * 依存: WithHistory
 */
export default function withBuilder(WrappedComponent: React.ComponentClass<WithBuilderPublicProps>) {

  @inject(STORE_EDITOR, STORE_BUILDER, STORE_LAYER_PALETTE, STORE_LAYOUT, STORE_UI, USECASE_BUILDER, USECASE_RAIL_TOOL, USECASE_PROJECT, USECASE_SELECTION)
  @observer
  class WithBuilder extends React.Component<WithBuilderProps, WithBuilderState> {

    _prevTool: Tools
    _prevPaletteItem: PaletteItem

    constructor(props: WithBuilderProps) {
      super(props)

      this.state = {
        newRailGroupDialogOpen: false,
        deleteOnRegistered: false,
      }
    }


    // mouseMove = (e: ToolEvent | any) => {
    //   // noop
    // }
    //
    // mouseDown = (e: ToolEvent | any) => {
    //   switch (e.event.button) {
    //     case 0:
    //       this.mouseLeftDown(e)
    //       break
    //     case 2:
    //       this.mouseRightDown(e)
    //       break
    //   }
    // }
    //
    // mouseLeftDown = (e: ToolEvent | any) => {
    //   // noop
    // }
    //
    // mouseRightDown = (e: ToolEvent | any) => {
    //   // noop
    // }


    keyUp = (e: ToolEvent | any) => {
      if (this.dialogExists()) return

      let methodName = 'keyUp_'
      if (e.modifiers.control) {
        methodName = methodName.concat('Ctrl')
      }
      if (e.modifiers.alt) {
        methodName = methodName.concat('Alt')
      }
      if (e.modifiers.shift) {
        methodName = methodName.concat('Shift')
      }
      methodName = methodName.concat(_.startCase(e.key))

      LOGGER.debug(methodName)
      if (this[methodName]) {
        this[methodName](e)
      }
    }

    keyDown = (e: ToolEvent | any) => {
      if (this.dialogExists()) return

      let methodName = 'keyDown_'
      if (e.modifiers.control) {
        methodName = methodName.concat('Ctrl')
      }
      if (e.modifiers.alt) {
        methodName = methodName.concat('Alt')
      }
      if (e.modifiers.shift) {
        methodName = methodName.concat('Shift')
      }
      methodName = methodName.concat(_.startCase(e.key))

      LOGGER.debug(methodName)
      if (this[methodName]) {
        this[methodName](e)
        e.preventDefault()
        e.stopPropagation()
      }
    }

    keyDown_Backspace = (e) => {
      // this.deleteSelectedRails()
      this.props.layout.commit()
      this.props.railToolUseCase.deleteSelected()
    }

    keyDown_CtrlC = (e) => {
    }

    keyDown_CtrlX = (e) => {
      this.props.layout.commit()
      this.props.railToolUseCase.registerRailGroup('Clipboard')
      this.props.railToolUseCase.deleteSelectedRails()
    }

    keyDown_CtrlV = (e) => {
      if (this.props.builder.getRailGroupItemData('Clipboard')
        && this._prevTool == null && this._prevPaletteItem == null) {
        LOGGER.info('CTRL V Down')
        this._prevTool = this.props.builder.activeTool
        this._prevPaletteItem = this.props.builder.paletteItem
        this.props.builder.setActiveTool(Tools.RAIL_GROUPS)
        this.props.builder.setPaletteItem({type: 'RailGroup', name: 'Clipboard'})
      }
    }

    keyUp_CtrlV = (e) => {
      if (this.props.builder.getRailGroupItemData('Clipboard')
        && this._prevTool != null && this._prevPaletteItem != null) {
        LOGGER.info('CTRL V Up')
        this.props.builder.setActiveTool(this._prevTool)
        this.props.builder.setPaletteItem(this._prevPaletteItem)
        this._prevTool = this._prevPaletteItem = null
      }
    }

    keyDown_CtrlA = (e) => {
    }

    keyDown_CtrlO = (e) => {
    }

    keyDown_CtrlF = (e) => {
    }

    keyDown_CtrlS = async (e) => {
    }

    keyDown_CtrlZ = (e) => {
    }

    keyDown_CtrlY = (e) => {
    }

    keyDown_CtrlR = (e) => {
      // this.props.layout.redo()
    }

    keyDown_Up = (e) => {
      this.props.builder.setAdjustmentAngle(this.props.builder.adjustmentAngle + 1)
    }

    keyDown_Down = (e) => {
      this.props.builder.setAdjustmentAngle(this.props.builder.adjustmentAngle - 1)
    }






    render() {
      return (
        <>
          <WrappedComponent
            {...this.props}
            // builderMouseDown={this.mouseDown}
            // builderMouseMove={this.mouseMove}
            builderKeyDown={this.keyDown}
            builderKeyUp={this.keyUp}
          />
        </>
      )
    }

    private dialogExists = () => {
      return document.querySelector("div[role='dialog']") != null
    }

    private getRailDataById = (id: number) => {
      return this.props.layout.currentLayoutData.rails.find(item => item.id === id)
    }

  }

  return WithBuilder
}


