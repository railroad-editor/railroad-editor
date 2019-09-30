import * as React from 'react'
import {Tools} from "constants/tools";
import {inject, observer} from "mobx-react";
import {BuilderStore} from "store/builderStore";
import {EditorStore} from "store/editorStore";
import {when} from "mobx";
import {STORE_BUILDER, STORE_EDITOR} from "../../store";

export interface WithToolsPrivateProps {
  builder?: BuilderStore
  editor?: EditorStore
}

export interface WithToolsPublicProps {
  // None
}

type WithToolsProps = WithToolsPublicProps & WithToolsPrivateProps


/**
 * キーボードでのツールの切替機能を提供するHOC。
 */
export default function withTools(WrappedComponent: React.ComponentClass<WithToolsProps>) {

  @inject(STORE_BUILDER, STORE_EDITOR)
  @observer
  class WithTools extends React.Component<WithToolsProps, {}> {
    private _prevTool: Tools

    constructor(props: WithToolsProps) {
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

      // ツールの切替はModifierを押さない状態で行うものとする。
      // Ctrl: コマンド
      // Alt: パンツール
      // Shift: 各ツールでの挙動切替
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        return
      }

      switch (e.key) {
        case 's':
          this.props.builder.setActiveTool(Tools.STRAIGHT_RAILS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.STRAIGHT_RAILS])
          break
        case 'c':
          this.props.builder.setActiveTool(Tools.CURVE_RAILS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.CURVE_RAILS])
          break
        case 't':
          this.props.builder.setActiveTool(Tools.TURNOUTS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.TURNOUTS])
          break
        case 'x':
          this.props.builder.setActiveTool(Tools.SPECIAL_RAILS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.SPECIAL_RAILS])
          break
        case 'g':
          this.props.builder.setActiveTool(Tools.RAIL_GROUPS)
          this.props.builder.setPaletteItem(this.props.builder.lastPaletteItems[Tools.RAIL_GROUPS])
          break
        case 'f':
          this.props.builder.setActiveTool(Tools.FEEDERS)
          break
        case 'j':
          this.props.builder.setActiveTool(Tools.GAP_JOINERS)
          break
        case 'm':
          this.props.builder.setActiveTool(Tools.MEASURE)
          break
      }
      e.preventDefault()
      e.stopPropagation()
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
