import * as React from 'react'
import {Tools} from "constants/tools";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER, STORE_COMMON} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import * as $ from "jquery";
import {CommonStore} from "store/commonStore";
import {when} from "mobx";

export interface WithToolsPrivateProps {
  builder?: BuilderStore
  common?: CommonStore
}

export interface WithToolsPublicProps {
  // None
}

type WithToolsProps =  WithToolsPublicProps & WithToolsPrivateProps


/**
 * キーボードでのツールの切替機能を提供するHOC。
 */
export default function withTools(WrappedComponent: React.ComponentClass<WithToolsProps>) {

  @inject(STORE_BUILDER, STORE_COMMON)
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
        () => this.props.common.isPaperLoaded,
        () => this.setKeyEventListener()
      )
    }


    dialogExists = () => {
      const dialogDivs = $('div[role="dialog"]')
      return dialogDivs.length > 0
    }


    keyDown = (e: KeyboardEvent|any) => {
      if (this.dialogExists()) return

      // これらのModifierのショートカットキーは現状扱わない
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return
      }

      switch (e.key) {
        case 'Alt':
          // シフトを押している間はPANツールが有効になる。離すと元に戻る
          this._prevTool = this.props.builder.activeTool
          this.props.builder.setActiveTool(Tools.PAN)
          break
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
        case 'f':
          this.props.builder.setActiveTool(Tools.FEEDERS)
          break
        case 'j':
          this.props.builder.setActiveTool(Tools.GAP_JOINERS)
          break
      }
      e.preventDefault()
      e.stopPropagation()
    }

    keyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Alt':
          this.props.builder.setActiveTool(this._prevTool)
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
