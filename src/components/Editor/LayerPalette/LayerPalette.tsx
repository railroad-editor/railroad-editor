import * as React from 'react'
import LayersIcon from 'material-ui-icons/Layers';
import {Checkbox, Grid, ListItemText, Paper} from 'material-ui'
import {TitleDiv} from "./styles";
import Rnd from 'react-rnd'
import {LayerListItem} from "components/Editor/LayerPalette/LayerListItem/LayerListItem";
import getLogger from "logging";
import {getClosest} from "constants/utils";
import LayerSettingDialog from "components/Editor/LayerPalette/LayerSettingDialog/LayerSettingDialog";
import {ConfirmationDialog} from "components/Editor/LayerPalette/ConfirmationDialog/ConfirmationDialog";
import Typography from "material-ui/Typography";
import {STORE_BUILDER, STORE_LAYOUT} from "constants/stores";
import {inject, observer} from "mobx-react";
import {LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import PaletteAddButton from "components/common/PaletteAddButton/PaletteAddButton";

const LOGGER = getLogger(__filename)

export interface LayerPaletteProps {
  className?: string
  layout?: LayoutStore
  builder?: BuilderStore
}

export interface LayerPaletteState {
  targetLayerId: number
  addDialogOpen: boolean
  updateDialogOpen: boolean
  deleteDialogOpen: boolean
}

const DEFAULT_LAYER_DATA = {
  id: 0,
  name: '',
  visible: true,
  color: '#000'
}


@inject(STORE_BUILDER, STORE_LAYOUT)
@observer
export default class LayerPalette extends React.Component<LayerPaletteProps, LayerPaletteState> {

  constructor(props: LayerPaletteProps) {
    super(props)
    this.state = {
      targetLayerId: null,
      addDialogOpen: false,
      updateDialogOpen: false,
      deleteDialogOpen: false
    }
    this.onToggleVisible = this.onToggleVisible.bind(this)
    this.onChangeActive = this.onChangeActive.bind(this)
    this.openDeleteDialog = this.openDeleteDialog.bind(this)
    this.openUpdateDialog = this.openUpdateDialog.bind(this)
  }

  onToggleVisible = (layerId: number) => (e: React.SyntheticEvent<HTMLInputElement>) => {
    const targetLayer = this.props.layout.currentLayoutData.layers.find(layer => layer.id === layerId)
    this.props.layout.updateLayer({
      id: layerId,
      visible: !targetLayer.visible,
    })
  }

  onChangeActive = (layerId: number) => (e: React.MouseEvent<HTMLElement>) => {
    this.props.builder.setActiveLayer(layerId)
  }


  openAddDialog = (e) => {
    this.setState({
      addDialogOpen: true,
    })
  }

  closeAddDialog = () => {
    this.setState({
      addDialogOpen: false,
    })
  }

  openUpdateDialog = (layerId: number) => (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      updateDialogOpen: true,
      targetLayerId: layerId
    })
  }

  closeRenameDialog = () => {
    this.setState({
      updateDialogOpen: false,
      targetLayerId: null
    })
  }

  openDeleteDialog = (layerId: number) => (e: React.MouseEvent<HTMLElement>) => {
    if (this.props.layout.currentLayoutData.layers.length < 2) {
      LOGGER.warn(`You cannot delete the last layer!`)
      return
    }
    this.setState({
      deleteDialogOpen: true,
      targetLayerId: layerId
    })
  }

  closeDeleteDialog = () => {
    this.setState({
      deleteDialogOpen: false,
      targetLayerId: null
    })
  }

  deleteLayer = () => {
    const layerId = this.state.targetLayerId
    const restLayerIds = this.props.layout.currentLayoutData.layers
      .map(layer => layer.id)
      .filter(id => id !== layerId)

    this.props.layout.deleteLayer({id: layerId})
    this.props.builder.setActiveLayer(getClosest(layerId, restLayerIds))
  }


  render() {
    const layers = this.props.layout.currentLayoutData.layers
    const activeLayer = layers.find(layer => layer.id === this.state.targetLayerId)

    return (
      <Rnd
        className={this.props.className}
        enableResizing={{}}
        dragHandleClassName='.Layers__title'
      >
        <Paper>
          <TitleDiv className='Layers__title'>
            <LayersIcon />
            {/* プラスアイコンを右端に配置するためのスタイル */}
            <Typography variant="subheading" color="inherit" style={{flex: 1}}>
              Layers
            </Typography>
            <PaletteAddButton onClick={this.openAddDialog}/>
          </TitleDiv>

          {layers.map((layer, index) =>
            <Grid container justify="center" spacing={0}>
              <React.Fragment key={`layer-${index}`}>
                <Grid item xs={3}>
                  <Checkbox
                    checked={layers[index].visible}
                    onChange={this.onToggleVisible(layer.id)}
                    value={layers[index].id.toString()}
                  />
                </Grid>
                <Grid item xs={9}>
                  {/* <Layer> で囲わずにSecondaryActionを使うとズレる */}
                  <LayerListItem
                    button
                    active={this.props.builder.activeLayerId === layer.id}
                    onClick={this.onChangeActive(layer.id)}
                    onDelete={this.openDeleteDialog(layer.id)}
                    onRename={this.openUpdateDialog(layer.id)}
                    isDeletable={layers.length >= 2}
                  >
                    <ListItemText primary={layer.name}/>
                  </LayerListItem>
                </Grid>
              </React.Fragment>
            </Grid>
          )}
        </Paper>
        <LayerSettingDialog
          title={'New Layer'}
          open={this.state.addDialogOpen}
          onClose={this.closeAddDialog}
          layer={DEFAULT_LAYER_DATA}
          addLayer={this.props.layout.addLayer}
        />
        <LayerSettingDialog
          title={'Layer Settings'}
          open={this.state.updateDialogOpen}
          onClose={this.closeRenameDialog}
          layer={activeLayer}
          updateLayer={this.props.layout.updateLayer}
        />
        <ConfirmationDialog
          title={'Delete Layer'}
          text={`Are you OK to delete "${activeLayer ? activeLayer.name: ''}"? \nAll rails on the layer are deleted.`}
          open={this.state.deleteDialogOpen}
          onOK={this.deleteLayer}
          onClose={this.closeDeleteDialog}
        />
      </Rnd>
    )
  }
}

