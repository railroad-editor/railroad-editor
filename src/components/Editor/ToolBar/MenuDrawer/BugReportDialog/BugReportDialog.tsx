import * as React from 'react'
import getLogger from "logging";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {FormDialog, FormDialogProps, FormDialogState, FormInputs} from "components/common/FormDialog/FormDialog";
import "react-fine-uploader/gallery/gallery.css";
import {withStyles} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import IssuesAPI from "apis/issues";
import {withSnackbar} from 'material-ui-snackbar-provider'
import {compose} from "recompose";

const LOGGER = getLogger(__filename)

const styles = theme => ({
  grid: {
    width: '500px'
  },
  type: {
    minWidth: '160px'
  },
  title: {},
  comment: {}
});

export interface BugReportDialogProps extends FormDialogProps {
  classes: any
  snackbar: any
}


export class BugReportDialog extends FormDialog<BugReportDialogProps, FormDialogState> {

  constructor(props: BugReportDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialInputs(): FormInputs {
    return {
      issueType: 'Bug',
    }
  }

  onOK = async () => {
    const {issueType, issueTitle, issueComment} = this.state.inputs
    const res = await IssuesAPI.createIssue({
      type: issueType,
      title: issueTitle,
      comment: issueComment,
    })
    this.props.snackbar.showMessage('Your issue is submitted successfully. Thank you for reporting!')
    this.onClose()
  }

  renderContent = () => {
    return (
      <>
        <Grid container spacing={1} className={this.props.classes.grid}>
          <Grid item xs={12}>
            <form>
              <FormControl>
                <InputLabel>Issue Type</InputLabel>
                <Select
                  name={'issueType'}
                  value={this.state.inputs['issueType']}
                  onChange={this.onChange('issueType')}
                  className={this.props.classes.type}
                >
                  <MenuItem value={'Bug'}>Bug</MenuItem>
                  <MenuItem value={'Feature Request'}>Feature Request</MenuItem>
                  <MenuItem value={'Others'}>Others</MenuItem>
                </Select>
              </FormControl>
            </form>
          </Grid>
          <Grid item xs={12}>
            <ValidatorForm
              ref={this.getFormRef}
            >
              <TextValidator
                label="Title"
                name="issueTitle"
                key="issueTitle"
                value={this.state.inputs['issueTitle']}
                onChange={this.onChange('issueTitle')}
                onKeyPress={this.onKeyPress}
                validatorListener={this.handleValidation}
                validators={['required']}
                errorMessages={['this field is required']}
                withRequiredValidator={true}
                fullWidth
              />
              <br/>
              <TextValidator
                label="Comment"
                name="issueComment"
                key="issueComment"
                value={this.state.inputs['issueComment']}
                onChange={this.onChange('issueComment')}
                onKeyPress={this.onKeyPress}
                validatorListener={this.handleValidation}
                validators={[]}
                errorMessages={[]}
                multiline={true}
                rows="8"
                fullWidth
              />
            </ValidatorForm>
          </Grid>
        </Grid>
      </>
    )
  }
}

export default compose<BugReportDialogProps, BugReportDialogProps | any>(
  withStyles(styles),
  withSnackbar()
)(BugReportDialog)
