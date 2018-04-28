import * as React from 'react'
import {connect} from "react-redux";
import {RootState} from "store/type";
import Palette from "components/Editor/Palette/Palette";

const mapStateToProps = (state: RootState) => {
  return {
    tool: state.tools.activeTool,
    userRailGroups: state.builder.userRailGroups,
    userCustomRails: state.builder.userCustomRails,
  }
};

const mapDispatchToProps = dispatch => {
  return {
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Palette)
