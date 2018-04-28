import * as React from 'react'
import {connect} from "react-redux";
import {RootState} from "store/type";
import Layout, {LayoutProps} from 'components/Editor/Layout/Layout';
import {activeLayerData, currentLayoutData} from "selectors";
import withBuilder from "components/hoc/withBuilder";
import {compose} from "recompose";
import {setIntersects} from "actions/builder";

const mapStateToProps = (state: RootState) => {
  return {
    layout: currentLayoutData(state),
    temporaryRails: state.builder.temporaryRails,
    temporaryRailGroup: state.builder.temporaryRailGroup,
    activeLayerId: state.builder.activeLayerId,
    activeLayerData: activeLayerData(state),
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setIntersects: (is: boolean) => dispatch(setIntersects(is))
  }
}

export default compose<LayoutProps, LayoutProps|any>(
  withBuilder,
  connect(mapStateToProps, mapDispatchToProps)
)(Layout)
