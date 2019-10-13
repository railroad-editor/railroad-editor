export enum Tools {
  STRAIGHT_RAILS = 'Straight Rails',
  CURVE_RAILS = 'Curve Rails',
  TURNOUTS = 'Turnouts',
  SPECIAL_RAILS = 'Special Rails',
  RAIL_GROUPS = 'Rail Groups',
  FEEDERS = 'Feeders',
  GAP_JOINERS = 'Gap Joiners',
  MEASURE = 'Measure'
}

export enum Commands {
  COPY = 'Copy',
  CUT = 'Cut',
  DELETE = 'Delete',
  UNDO = 'Undo',
  REDO = 'Redo',
  RESET_VIEW = 'Reset View',
}

export const TOOL_HOT_KEYS = {
  [Tools.STRAIGHT_RAILS]: 'S',
  [Tools.CURVE_RAILS]: 'C',
  [Tools.TURNOUTS]: 'T',
  [Tools.SPECIAL_RAILS]: 'X',
  [Tools.RAIL_GROUPS]: 'G',
  [Tools.FEEDERS]: 'F',
  [Tools.GAP_JOINERS]: 'J',
  [Tools.MEASURE]: 'M'
}

export const COMMAND_HOT_KEYS = {
  [Commands.COPY]: 'C',
  [Commands.CUT]: 'X',
  [Commands.DELETE]: 'Delete',
  [Commands.UNDO]: 'Undo',
  [Commands.REDO]: 'Redo',
  [Commands.RESET_VIEW]: 'Reset View',
}



export const DEFAULT_VIEW_WIDTH = 3840
export const DEFAULT_VIEW_HEIGHT = 2160

export const DEFAULT_PAPER_WIDTH = 2100
export const DEFAULT_PAPER_HEIGHT = 1400

export const DEFAULT_PAPER_COLOR = '#e6e6e6'
export const DEFAULT_PAPER_BACKGROUND_COLOR = '#333333'
export const DEFAULT_PAPER_LINE_COLOR = '#ff6666'

export const DEFAULT_GRID_SIZE = 70
export const DEFAULT_INITIAL_ZOOM = 1

// TODO: 環境によって適切な値は異なる？要調査
export const ZOOM_FACTOR = 0.002
export const ZOOM_MIN = 0.05
export const ZOOM_MAX = 10
export const ZOOM_CORRECTION = 0.08

export const TEMPORARY_RAIL_OPACITY = 0.5

export const DEFAULT_SELECTION_RECT_COLOR = '#CCFF00'
export const DEFAULT_SELECTION_RECT_OPACITY = 0.5
export const DEFAULT_SELECTED_COLOR = '#CCFF00'
export const DEFAULT_SELECTED_WIDTH = 2

export const RAIL_PUTTER_MARKER_RADIUS = 25
export const RAIL_PUTTER_MARKER_OPACITY = 0.5

export const DEFAULT_LAYER_TRANSLUCENT_OPACITY = 0.5

export const DEFAULT_SWITCHER_COLOR = '#616161'
export const DEFAULT_POWER_PACK_COLOR = '#616161'

export const CLOSED_JOINT_DISTANCE_TORELANCE = 5
export const CLOSED_JOINT_ANGLE_TORELANCE = 5

export const SKYWAY_API_KEY = '423ec210-715b-4916-971f-bd800a835414'
