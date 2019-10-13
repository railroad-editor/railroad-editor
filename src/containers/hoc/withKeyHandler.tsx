import * as React from 'react'
import {Tools} from "constants/tools";
import {inject, observer} from "mobx-react";
import {when} from "mobx";
import {WithBuilderStore, WithEditorStore, WithLayoutStore, WithUiStore} from "stores";
import {WithProjectUseCase, WithRailToolUseCase, WithSelectionToolUseCase} from "useCases";
import {LAYOUT_SAVED, REQUIRE_LOGIN} from "constants/messages";
import {I18n} from "aws-amplify";
import {STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT, STORE_UI} from "constants/stores";
import {USECASE_PROJECT, USECASE_RAIL_TOOL, USECASE_SELECTION} from "constants/useCases";

export type KeyHandler = {
  keyDown: (e: KeyboardEvent | any) => void
  keyUp: (e: KeyboardEvent | any) => void
}

export type WithKeyHandlerProps =
  {
    // keyHandler: KeyHandler
  }
  & WithBuilderStore
  & WithEditorStore
  & WithLayoutStore
  & WithUiStore
  & WithRailToolUseCase
  & WithSelectionToolUseCase
  & WithProjectUseCase


const KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l']

/**
 * キーボードでのツールの切替機能を提供するHOC。
 */
export default function withKeyHandler(WrappedComponent: React.ComponentClass<WithKeyHandlerProps>) {

  @inject(STORE_BUILDER, STORE_EDITOR, STORE_LAYOUT, STORE_UI, USECASE_RAIL_TOOL, USECASE_SELECTION, USECASE_PROJECT)
  @observer
  class WithTools extends React.Component<WithKeyHandlerProps, {}> {
    private _prevTool: Tools

    constructor(props: WithKeyHandlerProps) {
      super(props)
      this.state = {
        activeTool: 'select',
      }
      this._prevTool = null

      // Paperがマウントされて、ToolsのEventListenerが登録されてから
      // このHOCのEventListenerを登録する
      when(
        () => this.props.editor.isPaperLoaded,
        () => this.setKeyEventListener()
      )
    }

    keyDown = (e: KeyboardEvent | any) => {
      // ダイアログの表示中はツールの切替を行わない
      if (this.dialogExists()) return

      let result
      if (e.ctrlKey) {
        result = this.keyDownCtrl(e)
      } else {
        result = this.keyDownNormal(e)
      }

      if (result) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    keyDownNormalInRailMode = (e) => {
      if (! this.props.builder.isRailTool) {
        return false
      }
      const items = this.props.builder.presetRailPaletteItems[this.props.builder.activeTool]
      const idx = KEYS.findIndex(k => k === e.key);
      if (idx >= 0 && idx < items.length) {
        this.props.builder.setPaletteItem(items[idx])
        return true
      }
      return false
    }

    keyDownNormal = (e) => {
      let result = true
      switch (e.key) {
        case '1':
          this.props.builder.setActiveTool(Tools.STRAIGHT_RAILS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.STRAIGHT_RAILS])
          break
        case '2':
          this.props.builder.setActiveTool(Tools.CURVE_RAILS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.CURVE_RAILS])
          break
        case '3':
          this.props.builder.setActiveTool(Tools.TURNOUTS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.TURNOUTS])
          break
        case '4':
          this.props.builder.setActiveTool(Tools.SPECIAL_RAILS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.SPECIAL_RAILS])
          break
        case '5':
          this.props.builder.setActiveTool(Tools.RAIL_GROUPS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.RAIL_GROUPS])
          break
        case '6':
          this.props.builder.setActiveTool(Tools.FEEDERS)
          break
        case '7':
          this.props.builder.setActiveTool(Tools.GAP_JOINERS)
          break
        case '8':
          this.props.builder.setActiveTool(Tools.MEASURE)
          break
        case 'ArrowDown':
          this.props.builder.setAdjustmentAngle(this.props.builder.adjustmentAngle + 1)
          break
        case 'ArrowUp':
          this.props.builder.setAdjustmentAngle(this.props.builder.adjustmentAngle - 1)
          break
        case 'Backspace':
          this.props.layout.commit()
          this.props.railToolUseCase.deleteSelected()
          break
        default:
          result = false
      }
      result = result || this.keyDownNormalInRailMode(e)
      return result
    }


    keyDownCtrl = (e) => {
      switch (e.key) {
        case 'c':
          this.props.railToolUseCase.registerSelectedRailsAsRailGroup('Clipboard')
          this.props.selectionToolUseCase.selectAllRails(false)
          break
        case 'x':
          this.props.layout.commit()
          this.props.railToolUseCase.registerSelectedRailsAsRailGroup('Clipboard')
          this.props.railToolUseCase.deleteSelectedRails()
          break
        case 'a':
          this.props.selectionToolUseCase.selectRails(this.props.layout.currentLayoutData.rails.map(rail => rail.id), true)
          break
        case 'o':
          this.props.ui.setLayoutsDialog(true)
          break
        case 'f':
          this.props.ui.setCreateNewDialog(true)
          break
        case 's':
          if (this.props.editor.isAuth) {
            this.props.projectUseCase.saveLayout()
            this.props.ui.setCommonSnackbar(true, I18n.get(LAYOUT_SAVED), 'success')
          } else {
            this.props.ui.setLoginDialog(true)
            this.props.ui.setCommonSnackbar(true, I18n.get(REQUIRE_LOGIN), 'error')
          }
          break
        case 'z':
          this.props.layout.undo()
          break
        case 'y':
          this.props.layout.redo()
          break
        default:
          return false
      }
      return true
    }


    keyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Alt':
          // this.props.builder.setActiveTool(this._prevTool)
          break
      }
    }

    setKeyEventListener = () => {
      document.addEventListener('keydown', this.keyDown)
      document.addEventListener('keyup', this.keyUp)
    }

    componentWillUnmount() {
      document.removeEventListener('keydown', this.keyDown)
      document.removeEventListener('keyup', this.keyUp)
    }

    private dialogExists = () => {
      return document.querySelector("div[role='dialog']") != null
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
        />
      )
    }
  }

  return WithTools
}
