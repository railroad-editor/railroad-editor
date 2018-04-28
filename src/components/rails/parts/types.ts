// RAIL_COMPONENTSからレールパーツを参照するために必要な情報
export interface RailPartMeta {
  type: string
  partId: number
  railId: number
}

export interface JointMeta {
  type: string
  railId: number
  partId: number
}
