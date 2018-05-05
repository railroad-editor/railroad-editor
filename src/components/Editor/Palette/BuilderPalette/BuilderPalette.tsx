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
import * as classNames from "classnames"
import {PrimaryPaletteAddButton} from "components/common/PaletteAddButton/PaletteAddButton";
import Tooltip from "material-ui/Tooltip";

export interface BuilderPaletteProps {
  className?: string
  active: boolean
  title: string
  icon: ReactNode
  items: PaletteItem[]
  customItems?: any[]
  customDialog?: ReactNode
  openCustomDialog?: (e: React.SyntheticEvent<HTMLElement>) => void
  tooltipTitle?: string
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
        <HideableDiv className={classNames({
          'hidden': ! this.props.active
        })}
        >
          <ScrollablePaper>
            <TitleDiv className='Palette__title'>
              {this.props.icon}
              <Typography variant="subheading" color="inherit" style={{flex: 1}}>
                {this.props.title}
              </Typography>
              {this.props.customDialog &&
                <Tooltip title={this.props.tooltipTitle}>
                  <PrimaryPaletteAddButton onClick={this.props.openCustomDialog}/>
                </Tooltip>
              }
            </TitleDiv>
            <Selector
              items={this.props.items}
              selectItem={this.props.builder.setPaletteItem}
              paletteItem={this.props.builder.paletteItem}
            />
            {! _.isEmpty(this.props.customItems) &&
              <>
                <Divider />
                <Selector
                  items={this.props.customItems}
                  selectItem={this.props.builder.setPaletteItem}
                  paletteItem={this.props.builder.paletteItem}
                />
              </>
            }
          </ScrollablePaper>
        </HideableDiv>
        {this.props.customDialog}
      </div>
    )
  }
}

