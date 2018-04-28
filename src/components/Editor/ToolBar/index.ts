import {PaletteItem, RootState} from "store/type";
import {redo, undo} from "actions/layout";
import {connect} from "react-redux";
import {selectPaletteItem} from "actions/builder";
import {canRedo, canUndo, currentLayoutData} from "selectors";
import {ToolBar, ToolBarProps} from "components/Editor/ToolBar/ToolBar";
import withBuilder from "components/hoc/withBuilder";
import {compose} from "recompose";


const mapStateToProps = (state: RootState) => {
  return {
    lastPaletteItems: state.builder.lastPaletteItems,
    currentLayoutData: currentLayoutData(state),
    canUndo: canUndo(state),
    canRedo: canRedo(state),
    authData: state.tools.authData,
    layoutMeta: state.layout.meta,
  }
};

const mapDispatchToProps = dispatch => {
  return {
    selectPaletteItem: (item: PaletteItem) => dispatch(selectPaletteItem(item)),
    undo: () => dispatch(undo({})),
    redo: () => dispatch(redo({}))
  }
};

export default compose<ToolBarProps, ToolBarProps|any>(
  withBuilder,
  connect(mapStateToProps, mapDispatchToProps)
)(ToolBar)
