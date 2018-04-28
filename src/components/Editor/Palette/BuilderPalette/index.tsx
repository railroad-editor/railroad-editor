import * as React from 'react'
import {connect} from "react-redux";
import {PaletteItem, RootState} from "store/type";
import {selectPaletteItem} from "actions/builder";
import BuilderPalette from "components/Editor/Palette/BuilderPalette/BuilderPalette";

const mapStateToProps = (state: RootState) => {
  return {
    paletteItem: state.builder.paletteItem
  }
};

const mapDispatchToProps = dispatch => {
  return {
    selectItem: (item: PaletteItem) => dispatch(selectPaletteItem(item))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(BuilderPalette)
