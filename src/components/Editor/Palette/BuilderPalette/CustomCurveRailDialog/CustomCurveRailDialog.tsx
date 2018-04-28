import * as React from "react";
import Dialog from "material-ui/Dialog";
import {DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup} from "material-ui";
import Button from "material-ui/Button";
import Checkbox from "material-ui/Checkbox";
import {Tools} from "constants/tools";
import TextField from "material-ui/TextField";
import AutoFocusTextField from "components/common/AutoFocusTextField";
import RailPartBase from "components/rails/parts/RailPartBase";
import {RailItemData} from "components/rails";

export interface CustomCurveRailDialogProps {
  open: boolean
  onClose: () => void
  addUserCustomRail: (item: RailItemData) => void
}

export interface CustomCurveRailDialogState {
  name: string
  radius: string
  centerAngle: string
  innerRadius: string
  outerRadius: string
  errors: any
  errorTexts: any
  isDouble: boolean
}


export default class CustomCurveRailDialog extends React.Component<CustomCurveRailDialogProps, CustomCurveRailDialogState> {

  static INITIAL_STATE = {
    name: '',
    radius: '',
    centerAngle: '',
    innerRadius: '',
    outerRadius: '',
    errors: {
      name: false,
      radius: false,
      centerAngle: false,
    },
    errorTexts: {
      name: '',
      radius: '',
      centerAngle: '',
    },
    isDouble: false,
  }

  constructor(props: CustomCurveRailDialogProps) {
    super(props)
    this.state = CustomCurveRailDialog.INITIAL_STATE

    this.onDoubleChange = this.onDoubleChange.bind(this)
  }

  onEnter = (e) => {
    this.setState(CustomCurveRailDialog.INITIAL_STATE)
  }

  onOK = (e) => {
    const {isDouble, radius, innerRadius, outerRadius, centerAngle, name} = this.state
    if (isDouble) {
      this.props.addUserCustomRail({
        type: 'DoubleCurveRail',
        innerRadius: parseInt(innerRadius),   // string -> number への変換を忘れないように
        outerRadius: parseInt(outerRadius),
        centerAngle: parseInt(centerAngle),
        name: name,
        paletteName: Tools.CURVE_RAILS,
      })
    } else {
      this.props.addUserCustomRail({
        type: 'CurveRail',
        radius: parseInt(radius),
        centerAngle: parseInt(centerAngle),
        name: name,
        paletteName: Tools.CURVE_RAILS,
      })
    }

    this.props.onClose()
  }


  onDoubleChange = (e: React.SyntheticEvent<HTMLInputElement|any>) => {
    this.setState({
      isDouble: ! this.state.isDouble,
    });
  };

  onTextChange = (name: string) => (e: React.SyntheticEvent<HTMLInputElement|any>) => {
    const text = e.currentTarget.value
    if (text && text.match(/\d+/)) {
      this.setState({
        [name]: text,
        errors: {
          ...this.state.errors,
          [name]: false,
        }
      } as CustomCurveRailDialogState)
    } else {
      this.setState({
        [name]: text,
        errors: {
          ...this.state.errors,
          [name]: true,
        },
        errorTexts: {
          ...this.state.errorTexts,
          [name]: 'Must not be empty.'
        }
      } as CustomCurveRailDialogState)
    }
  }

  /**
   * OuterRadiusをInnerRadiusの値でオートコンプリートする
   */
  onInnterRadiusBlur = () => {
    const {innerRadius, outerRadius} = this.state
    if (innerRadius && ! outerRadius) {
      this.setState({
        outerRadius: (parseInt(innerRadius) + RailPartBase.RAIL_SPACE).toString()
      })
    }
  }

  /**
   * InnerRadiusをOuterRadiusの値でオートコンプリートする
   */
  onOuterRadiusBlur = () => {
    const {innerRadius, outerRadius} = this.state
    if (outerRadius && ! innerRadius) {
      this.setState({
        innerRadius: (parseInt(this.state.outerRadius) - RailPartBase.RAIL_SPACE).toString()
      })
    }
  }

  render() {
    const { open, onClose } = this.props
    const { radius, innerRadius, outerRadius, centerAngle, isDouble, name} = this.state
    const disabled = ! ((isDouble && innerRadius && outerRadius) || (! isDouble && radius))

    return (
      <Dialog
        open={open}
        onEnter={this.onEnter}
        onClose={onClose}
      >
        <DialogTitle id={"custom-curve-rail"}>Custom Curve Rail</DialogTitle>
        <DialogContent>
          <FormGroup>
            {this.state.isDouble &&
              <React.Fragment>
                <FormControl>
                  <AutoFocusTextField
                    label="Inner Radius"
                    type="number"
                    value={this.state.innerRadius}
                    onChange={this.onTextChange('innerRadius')}
                    onBlur={this.onInnterRadiusBlur}
                  />
                </FormControl>
                <FormControl>
                  <TextField
                    label="Outer Radius"
                    type="number"
                    value={this.state.outerRadius}
                    onChange={this.onTextChange('outerRadius')}
                    onBlur={this.onOuterRadiusBlur}
                  />
                </FormControl>
              </React.Fragment>
            }
            {! this.state.isDouble &&
              <FormControl>
                <AutoFocusTextField
                  label="Radius"
                  type="number"
                  value={this.state.radius}
                  onChange={this.onTextChange('radius')}
                />
              </FormControl>
            }
            <FormControl>
              <TextField
                label="Center Angle"
                type="number"
                value={this.state.centerAngle}
                onChange={this.onTextChange('centerAngle')}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={this.state.isDouble}
                  onChange={this.onDoubleChange}
                />
              }
              label={"Double"}
            />
            <FormControl>
              <TextField
                label="Name"
                value={this.state.name}
                onChange={this.onTextChange('name')}
              />
            </FormControl>
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button disabled={disabled} variant="raised" onClick={this.onOK} color="primary">
            OK
          </Button>
          <Button onClick={onClose} color="primary" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
