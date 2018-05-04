import {API} from "aws-amplify";
import {RailItemData} from "components/rails";
import {LayoutConfig, LayoutData, LayoutMeta} from "store/layoutStore";
import {UserRailGroupData} from "store/builderStore";


export interface LayoutList {
  layouts: LayoutMeta[]
}

export interface LayoutDataWithMeta {
  layout: LayoutData
  meta: LayoutMeta
  config: LayoutConfig
  userRailGroups: UserRailGroupData[]
  userCustomRails: RailItemData[]
}


const fetchLayoutList = async (userId: string): Promise<LayoutMeta[]> => {
  const result = await API.get('Layout', `/users/${userId}/layouts`, {headers: {}})
  return result.layouts
}

const fetchLayoutData = async (userId: string, layoutId: string): Promise<LayoutDataWithMeta> => {
  return await API.get('Layout', `/users/${userId}/layouts/${layoutId}`, {headers: {}})
}

const saveLayoutData = async (userId: string,
                              layoutData: LayoutData,
                              layoutMeta: LayoutMeta,
                              userRailGroups: UserRailGroupData[],
                              userCustomRails: RailItemData[]
                              ) => {
  const layoutId = layoutMeta.id
  return await API.put('Layout', `/users/${userId}/layouts/${layoutId}`, {
    headers: {},
    body: {
      layout: layoutData,
      meta: layoutMeta,
      userRailGroups: userRailGroups,
      userCustomRails: userCustomRails
    }
  })
}

const deleteLayoutData = async (userId: string, layoutId: string) => {
  return await API.del('Layout', `/users/${userId}/layouts/${layoutId}`, {headers: {}})
}

export default {
  fetchLayoutList,
  fetchLayoutData,
  saveLayoutData,
  deleteLayoutData
}
