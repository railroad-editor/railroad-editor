import {RootState} from "store/type";
import {connect} from "react-redux";
import {LoginDialog, LoginDialogProps} from "components/Editor/ToolBar/LoginDialog/LoginDialog";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {compose} from "recompose";

const mapStateToProps = (state: RootState) => {
  return {
  }
};

const mapDispatchToProps = dispatch => {
  return {
  }
};

export default compose<LoginDialogProps, LoginDialogProps|any>(
  withSnackbar(),
  connect(mapStateToProps, mapDispatchToProps),
)(LoginDialog)

