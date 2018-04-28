import * as React from 'react'
import {connect} from 'react-redux';
import {setTool} from "../../actions/tools";
import {PaletteItem, RootState} from "store/type";
import {selectPaletteItem} from "actions/builder";
import {LastPaletteItems} from "reducers/builder";
import {Tools} from "constants/tools";

export interface WithToolsPrivateProps {
  activeTool: string
  setTool: (tool: string, mode?: any) => void
  lastPaletteItems: LastPaletteItems
  selectPaletteItem: (item: PaletteItem) => void
}

export interface WithToolsPublicProps {
  // None
}

type WithToolsProps =  WithToolsPublicProps & WithToolsPrivateProps


/**
 * キーボードでのツールの切替機能を提供するHOC。
 */
export default function withTools(WrappedComponent: React.ComponentClass<WithToolsPublicProps>) {

  const mapStateToProps = (state: RootState): Partial<WithToolsPrivateProps> => {
    return {
      activeTool: state.tools.activeTool,
      lastPaletteItems: state.builder.lastPaletteItems
    }
  }

  const mapDispatchToProps = (dispatch: any) => {
    return {
      setTool: (tool: string) => dispatch(setTool(tool)),
      selectPaletteItem: (item: PaletteItem) => dispatch(selectPaletteItem(item))
    }
  }

  class WithToolsComponent extends React.Component<WithToolsProps, {}> {
    private _prevTool: string | null;

    constructor(props: WithToolsProps) {
      super(props)
      this.state = {
        activeTool: 'select',
      }
      this._prevTool = null
    }

    keyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Alt':
          // シフトを押している間はPANツールが有効になる。離すと元に戻る
          this._prevTool = this.props.activeTool
          this.props.setTool(Tools.PAN)
          break
      }
      //   case 's':
      //     this.props.setTool(Tools.STRAIGHT_RAILS)
      //     this.props.selectPaletteItem(this.props.lastPaletteItems[Tools.STRAIGHT_RAILS])
      //     break
      //   case 'c':
      //     this.props.setTool(Tools.CURVE_RAILS)
      //     this.props.selectPaletteItem(this.props.lastPaletteItems[Tools.CURVE_RAILS])
      //     break
      //   case 't':
      //     this.props.setTool(Tools.TURNOUTS)
      //     this.props.selectPaletteItem(this.props.lastPaletteItems[Tools.TURNOUTS])
      //     break
      //   case 'd':
      //     this.props.setTool(Tools.DELETE)
      //     break
      // }
    }

    keyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Alt':
          this.props.setTool(this._prevTool)
          break
      }
    }

    componentDidMount() {
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

  return connect(mapStateToProps, mapDispatchToProps)(WithToolsComponent)
}
