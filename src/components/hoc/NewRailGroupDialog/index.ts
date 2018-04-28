import {RootState} from "store/type";
import {connect} from "react-redux";
import NewRailGroupDialog from "components/hoc/NewRailGroupDialog/NewRailGroupDialog";

const mapStateToProps = (state: RootState) => {
  return {
  }
};

const mapDispatchToProps = dispatch => {
  return {
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(NewRailGroupDialog)
