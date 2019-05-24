import * as React from 'react'
import LayersIcon from '@material-ui/icons/Layers';
import {Checkbox, Grid} from '@material-ui/core'
import {ScrollablePaper} from "./LayerPalette.style";
import Rnd from 'react-rnd'
import {LayerListItem} from "components/Editor/Palettes/BuilderPalettes/LayerPalette/LayerListItem/LayerListItem";
import getLogger from "logging";
import LayerSettingDialog
  from "components/Editor/Palettes/BuilderPalettes/LayerPalette/LayerSettingDialog/LayerSettingDialog";
import {ConfirmationDialog} from "components/Editor/Palettes/BuilderPalettes/LayerPalette/ConfirmationDialog/ConfirmationDialog";
import {STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC} from "constants/stores";
import {inject, observer} from "mobx-react";
import {DEFAULT_LAYER_DATA, LayoutStore} from "store/layoutStore";
import {BuilderStore} from "store/builderStore";
import {SecondaryPaletteAddButton} from "components/common/PaletteAddButton/PaletteAddButton";
import Tooltip from "@material-ui/core/Tooltip";
import {DEFAULT_LAYER_TRANSLUCENT_OPACITY} from "constants/tools";
import {LayoutLogicStore} from "store/layoutLogicStore";
import {TitleDiv, TitleTypography} from "components/Editor/Palettes/Palettes.style";

const LOGGER = getLogger(__filename)

export interface LayerPaletteProps {
  className?: string
  layout?: LayoutStore
  layoutLogic?: LayoutLogicStore
  builder?: BuilderStore
}

export interface LayerPaletteState {
  targetLayerId: number
  addDialogOpen: boolean
  updateDialogOpen: boolean
  deleteDialogOpen: boolean
}

const LayerStates = {
  VISIBLE: {visible: true, opacity: 1},
  TRANSLUCENT: {visible: true, opacity: DEFAULT_LAYER_TRANSLUCENT_OPACITY},
  INVISIBLE: {visible: false, opacity: 1}
}


@inject(STORE_BUILDER, STORE_LAYOUT, STORE_LAYOUT_LOGIC)
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


  toggleLayerVisibility = (visible: boolean, opacity: number) => {
    if (visible && opacity === 1) {
      return LayerStates.TRANSLUCENT
    }
    if (visible && opacity < 1) {
      return LayerStates.INVISIBLE
    }
    if (! visible) {
      return LayerStates.VISIBLE
    }
    // fallback
    return LayerStates.VISIBLE
  }

  onToggleVisible = (layerId: number) => (e: React.SyntheticEvent<HTMLInputElement>) => {
    const targetLayer = this.props.layout.currentLayoutData.layers.find(layer => layer.id === layerId)
    const {visible, opacity} = this.toggleLayerVisibility(targetLayer.visible, targetLayer.opacity)
    this.props.layout.updateLayer({
      id: layerId,
      visible,
      opacity
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
    this.props.layoutLogic.deleteLayer(layerId)
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
        <ScrollablePaper>
          <TitleDiv className='Layers__title'>
            <LayersIcon/>
            {/* プラスアイコンを右端に配置するためのスタイル */}
            <TitleTypography variant="subheading" color="inherit">
              Layers
            </TitleTypography>
            <Tooltip title="Add Layer">
              <SecondaryPaletteAddButton onClick={this.openAddDialog}/>
            </Tooltip>
          </TitleDiv>

          {layers.map((layer, idx) =>
            <Grid container justify="center" wrap="nowrap" spacing={0} key={`layer-${idx}`}>
              <Grid
                item xs={3}
                style={{minWidth: '48px'}}
              >
                <Checkbox
                  checked={layers[idx].visible}
                  onChange={this.onToggleVisible(layer.id)}
                  value={layers[idx].id.toString()}
                  style={{
                    color: layer.color
                  }}
                  indeterminate={layer.visible && layer.opacity < 1}
                />
              </Grid>
              <Grid item xs={9}>
                {/* <List> で囲わずにSecondaryActionを使うとズレる */}
                <LayerListItem
                  button
                  active={this.props.builder.activeLayerId === layer.id}
                  onClick={this.onChangeActive(layer.id)}
                  onDelete={this.openDeleteDialog(layer.id)}
                  onRename={this.openUpdateDialog(layer.id)}
                  isDeletable={layers.length >= 2}
                  text={layer.name}
                >
                </LayerListItem>
              </Grid>
            </Grid>
          )}
        </ScrollablePaper>
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
          text={`Are you OK to delete "${activeLayer ? activeLayer.name : ''}"? \nAll rails on the layer are deleted.`}
          open={this.state.deleteDialogOpen}
          onOK={this.deleteLayer}
          onClose={this.closeDeleteDialog}
        />
      </Rnd>
    )
  }
}

