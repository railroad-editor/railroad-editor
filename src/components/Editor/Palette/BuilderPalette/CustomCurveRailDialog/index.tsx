import * as React from 'react'
import {connect} from "react-redux";
import {RootState} from "store/type";
import {addUserCustomRail} from "actions/builder";
import CustomCurveRailDialog
  from "components/Editor/Palette/BuilderPalette/CustomCurveRailDialog/CustomCurveRailDialog";
import {RailItemData} from "components/rails";

const mapStateToProps = (state: RootState) => {
  return {
  }
};

const mapDispatchToProps = dispatch => {
  return {
    addUserCustomRail: (item: RailItemData) => dispatch(addUserCustomRail(item))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomCurveRailDialog)
