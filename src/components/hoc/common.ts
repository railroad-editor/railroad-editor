import {LayoutData} from "reducers/layout";

/**
 * 指定のRailIDを持つレールをレイアウトから探して返す。
 * @param {LayoutData} layout
 * @param {number} id
 * @returns {RailData | undefined}
 */
export const getRailDataById = (layout: LayoutData, id: number) => {
  return layout.rails.find(item => item.id === id)
}

