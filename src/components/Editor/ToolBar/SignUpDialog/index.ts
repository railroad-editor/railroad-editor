import {RootState} from "store/type";
import {connect} from "react-redux";
import {SignUpDialog, SignUpDialogProps} from "components/Editor/ToolBar/SignUpDialog/SignUpDialog";
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

export default compose<SignUpDialogProps, SignUpDialogProps|any>(
  withSnackbar(),
  connect(mapStateToProps, mapDispatchToProps),
)(SignUpDialog)

