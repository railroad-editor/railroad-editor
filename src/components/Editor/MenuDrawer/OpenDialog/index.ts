import {RootState} from "store/type";
import {setLayoutData, setLayoutMeta} from "actions/layout";
import {connect} from "react-redux";
import {LayoutData, LayoutMeta} from "reducers/layout";
import {OpenDialog} from "components/Editor/MenuDrawer/OpenDialog/OpenDialog";
import {addUserCustomRail, addUserRailGroup} from "actions/builder";
import {UserRailGroupData} from "reducers/builder";
import {RailItemData} from "components/rails";

const mapStateToProps = (state: RootState) => {
  return {
    authData: state.tools.authData
  }
};

const mapDispatchToProps = dispatch => {
  return {
    setLayoutData: (data: LayoutData) => dispatch(setLayoutData(data)),
    setLayoutMeta: (meta: LayoutMeta) => dispatch(setLayoutMeta(meta)),
    addUserRailGroup: (railGroup: UserRailGroupData) => dispatch(addUserRailGroup(railGroup)),
    addUserCustomRail: (item: RailItemData) => dispatch(addUserCustomRail(item)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(OpenDialog)
