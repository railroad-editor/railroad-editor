import * as React from 'react'
import getLogger from "logging";
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import {FormDialog, FormDialogProps, FormDialogState} from "components/common/FormDialog/FormDialog";
import "react-fine-uploader/gallery/gallery.css";
import {withStyles} from "@material-ui/core";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";

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
}


export class BugReportDialog extends FormDialog<BugReportDialogProps, FormDialogState> {

  constructor(props: BugReportDialogProps) {
    super(props)
    this.state = this.getInitialState()
  }

  getInitialState = () => {
    return {
      inputs: {
        issueType: 'Bug',
      },
      disabled: true
    }
  }

  onOK = () => {
    // TODO: call Bug Report API

    this.onClose()
  }

  renderContent = () => {
    return (
      <>
        <Grid container spacing={8} className={this.props.classes.grid}>
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
              ref={(form) => this._form = form}
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

export default withStyles(styles)(BugReportDialog);
