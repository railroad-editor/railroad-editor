import * as React from 'react'
import {inject, observer} from "mobx-react";
import {STORE_COMMON} from "constants/stores";
import {compose} from "recompose";
import {StyledRailPalette, StyledLayerPalette} from "components/Editor/Palettes/BuilderPalettes/BuilderPalettes.style";
import {EditorMode} from "store/uiStore";
import {CommonStore} from "store/commonStore";


export interface PalettesProps {
    common?: CommonStore
}

@inject(STORE_COMMON)
@observer
export class BuilderPalettes extends React.Component<PalettesProps> {

    constructor(props: PalettesProps) {
        super(props)
    }

    render() {
        return (
            <>
                <div hidden={this.props.common.editorMode !== EditorMode.BUILDER}>
                    <StyledRailPalette />
                </div>
                <div hidden={this.props.common.editorMode !== EditorMode.SIMULATOR}>
                    <StyledLayerPalette />
                </div>
            </>
        )
    }
}


export default compose<PalettesProps, PalettesProps>(
)(BuilderPalettes)

