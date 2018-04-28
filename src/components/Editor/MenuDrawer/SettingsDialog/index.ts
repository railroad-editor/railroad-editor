import {RootState} from "store/type";
import {connect} from "react-redux";
import {SettingsDialog} from "components/Editor/MenuDrawer/SettingsDialog/SettingsDialog";
import {setConfig} from "actions/settings";
import {SettingsStoreState} from "reducers/settings";

const mapStateToProps = (state: RootState) => {
  return {
    settings: state.settings
  }
};

const mapDispatchToProps = dispatch => {
  return {
    setConfig: (settings: SettingsStoreState) => dispatch(setConfig(settings))
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsDialog)
