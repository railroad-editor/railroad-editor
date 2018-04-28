import * as React from 'react'
import {ReactNode} from 'react'
import {HideableDiv,} from "./BuilderPalette.style";
import Selector from "./Selector/Selector"
import {TitleDiv} from "../../LayerPalette/styles";
import Paper from "material-ui/Paper";
import {PaletteItem} from "store/type";
import Typography from "material-ui/Typography";
import AddCustomRailButton from "components/Editor/Palette/BuilderPalette/AddCustomRailButton/AddCustomRailButton";
import Divider from "material-ui/Divider";

export interface BuilderPaletteProps {
  className?: string
  active: boolean
  title: string
  icon: ReactNode
  items: PaletteItem[]
  paletteItem: PaletteItem
  selectItem: (item: PaletteItem) => void
  customItems?: any[]
  customDialog?: ReactNode
  openCustomDialog?: (e: React.SyntheticEvent<HTMLElement>) => void
}


export default class BuilderPalette extends React.Component<BuilderPaletteProps, {}> {

  constructor(props: BuilderPaletteProps) {
    super(props)
    this.state = {
      addDialogOpen: false
    }
  }

  render() {
    return (
      // styleを上書きするために必要
      <div className={this.props.className}>
        <HideableDiv className={`${this.props.active ? '' : 'hidden'}`}>
          <Paper>
            <TitleDiv className='Palette__title'>
              {this.props.icon}
              <Typography variant="subheading" color="inherit" style={{flex: 1}}>
                {this.props.title}
              </Typography>
              {this.props.customDialog &&
                <AddCustomRailButton onClick={this.props.openCustomDialog}/>
              }
            </TitleDiv>
            <Selector
              items={this.props.items}
              selectItem={this.props.selectItem}
              paletteItem={this.props.paletteItem}
            />
            {! _.isEmpty(this.props.customItems) &&
              <React.Fragment>
                <Divider />
                <Selector
                  items={this.props.customItems}
                  selectItem={this.props.selectItem}
                  paletteItem={this.props.paletteItem}
                />
              </React.Fragment>
            }
          </Paper>
        </HideableDiv>
        {this.props.customDialog}
      </div>
    )
  }
}

