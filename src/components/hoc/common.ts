/**
 * 指定のRailIDを持つレールをレイアウトから探して返す。
 * @param {LayoutData} layout
 * @param {number} id
 * @returns {RailData | undefined}
 */
import {LayoutData} from "store/layoutStore";

export const getRailDataById = (layout: LayoutData, id: number) => {
  return layout.rails.find(item => item.id === id)
}

