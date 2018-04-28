import {RootState} from "store/type";
import {setPaperViewLoaded} from "actions/builder";
import {connect} from "react-redux";
import {GridPaper} from "components/Editor/GridPaper/GridPaper";

const mapStateToProps = (state: RootState) => {
  return {
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return {
    setPaperViewLoaded: (loaded: boolean) => dispatch(setPaperViewLoaded(loaded))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(GridPaper)
