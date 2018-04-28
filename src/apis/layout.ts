import {API} from "aws-amplify";
import {LayoutData, LayoutMeta} from "reducers/layout";
import {UserRailGroupData} from "reducers/builder";
import {RailItemData} from "components/rails";


export interface LayoutList {
  layouts: LayoutMeta[]
}

export interface LayoutDataWithMeta {
  layout: LayoutData
  meta: LayoutMeta
  userRailGroups: UserRailGroupData[]
  userCustomRails: RailItemData[]
}


const fetchLayoutList = async (userId: string): Promise<LayoutList> => {
  return await API.get('Layout', `/users/${userId}/layouts`, {headers: {}})
}

const fetchLayoutData = async (userId: string, layoutId: string): Promise<LayoutDataWithMeta> => {
  return await API.get('Layout', `/users/${userId}/layouts/${layoutId}`, {headers: {}})
}

const saveLayoutData = async (userId: string, layoutData: LayoutDataWithMeta) => {
  const layoutId = layoutData.meta.id
  return await API.put('Layout', `/users/${userId}/layouts/${layoutId}`, {
    headers: {},
    body: layoutData
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
