import {RootState} from "store/type";
import {connect} from "react-redux";
import {deleteTemporaryRail} from "actions/builder";
import FirstRailPutter, {FirstRailPutterProps} from "components/Editor/FirstRailPutter/FirstRailPutter";
import {compose} from "recompose";
import {nextRailId} from "selectors";
import withBuilder from "components/hoc/withBuilder";


const mapStateToProps = (state: RootState) => {
  return {
    paletteItem: state.builder.paletteItem,
    temporaryRails: state.builder.temporaryRails,
    nextRailId: nextRailId(state),
    activeLayerId: state.builder.activeLayerId,
    settings: state.settings
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    deleteTemporaryRail: () => dispatch(deleteTemporaryRail({})),
  }
}



export default compose<FirstRailPutterProps, FirstRailPutterProps|any>(
  withBuilder,
  connect(mapStateToProps, mapDispatchToProps),
)(FirstRailPutter)
