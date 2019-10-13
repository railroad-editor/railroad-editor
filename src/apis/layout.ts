import {API} from "aws-amplify";
import {LayoutConfig, LayoutData, LayoutMeta} from "stores/layoutStore";
import {RailGroupData, RailItemData} from "stores";


export interface LayoutList {
  layouts: LayoutMeta[]
}

export interface ProjectData {
  layout: LayoutData
  meta: LayoutMeta
  config: LayoutConfig
  userRailGroups: RailGroupData[]
  userRails: RailItemData[]
}


const fetchLayoutList = async (userId: string): Promise<LayoutMeta[]> => {
  const result = await API.get('layout', `/users/${userId}/layouts`, {headers: {}})
  return result.layouts.map(layout => layout.meta)
}

const fetchLayoutData = async (userId: string, layoutId: string): Promise<ProjectData> => {
  return await API.get('layout', `/users/${userId}/layouts/${layoutId}`, {headers: {}})
}

const saveLayoutData = async (userId: string,
                              layoutData: LayoutData,
                              layoutMeta: LayoutMeta,
                              layoutConfig: LayoutConfig,
                              userRailGroups: RailGroupData[],
                              userCustomRails: RailItemData[]
) => {
  const layoutId = layoutMeta.id
  const body: ProjectData = {
    layout: layoutData,
    meta: layoutMeta,
    config: layoutConfig,
    userRailGroups: userRailGroups,
    userRails: userCustomRails
  }
  return await API.put('layout', `/users/${userId}/layouts/${layoutId}`, {
    headers: {'Content-Type': 'application/json'},
    body: body
  })
}

const deleteLayoutData = async (userId: string, layoutId: string) => {
  return await API.del('layout', `/users/${userId}/layouts/${layoutId}`, {headers: {}})
}

export default {
  fetchLayoutList,
  fetchLayoutData,
  saveLayoutData,
  deleteLayoutData
}
