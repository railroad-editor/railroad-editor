import * as React from 'react'
import {ReactNode} from 'react'
import {HideableDiv, ScrollablePaper,} from "./style";
import Selector from "./Selector/Selector"
import {TitleDiv} from "../../LayerPalette/styles";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import {inject, observer} from "mobx-react";
import {STORE_BUILDER} from "constants/stores";
import {BuilderStore} from "store/builderStore";
import PaletteAddButton from 'components/common/PaletteAddButton/PaletteAddButton';

export interface BuilderPaletteProps {
  className?: string
  active: boolean
  title: string
  icon: ReactNode
  items: PaletteItem[]
  customItems?: any[]
  customDialog?: ReactNode
  openCustomDialog?: (e: React.SyntheticEvent<HTMLElement>) => void
  builder?: BuilderStore
}


@inject(STORE_BUILDER)
@observer
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
          <ScrollablePaper>
            <TitleDiv className='Palette__title'>
              {this.props.icon}
              <Typography variant="subheading" color="inherit" style={{flex: 1}}>
                {this.props.title}
              </Typography>
              {this.props.customDialog &&
                <PaletteAddButton onClick={this.props.openCustomDialog}/>
              }
            </TitleDiv>
            <Selector
              items={this.props.items}
              selectItem={this.props.builder.setPaletteItem}
              paletteItem={this.props.builder.paletteItem}
            />
            {! _.isEmpty(this.props.customItems) &&
              <React.Fragment>
                <Divider />
                <Selector
                  items={this.props.customItems}
                  selectItem={this.props.builder.setPaletteItem}
                  paletteItem={this.props.builder.paletteItem}
                />
              </React.Fragment>
            }
          </ScrollablePaper>
        </HideableDiv>
        {this.props.customDialog}
      </div>
    )
  }
}

