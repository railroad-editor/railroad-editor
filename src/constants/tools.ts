import {SCALE} from "constants/parts";

export enum Tools {
  STRAIGHT_RAILS = 'Straight Rails',
  CURVE_RAILS = 'Curve Rails',
  TURNOUTS = 'Turnouts',
  SPECIAL_RAILS = 'Special Rails',
  RAIL_GROUPS = 'Rail Groups',
  FEEDERS = 'Feeders',
  GAP = 'Gaps',
  SELECT = 'Select',
  PAN = 'Pan',
  UNDO = 'Undo',
  REDO = 'Redo',
  RESET_VIEW = 'Centerize View',
  DELETE = 'Delete',
}

export const DEFAULT_VIEW_WIDTH = 1920
export const DEFAULT_VIEW_HEIGHT = 1080

export const DEFAULT_PAPER_WIDTH = 2100
export const DEFAULT_PAPER_HEIGHT = 1400

export const DEFAULT_PAPER_COLOR = '#e6e6e6'
export const DEFAULT_PAPER_BACKGROUND_COLOR = '#333333'
export const DEFAULT_PAPER_LINE_COLOR = '#ff6666'

export const DEFAULT_GRID_SIZE = 70
export const DEFAULT_INITIAL_ZOOM = 1

export const ZOOM_FACTOR = 0.002
export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 10

export const TEMPORARY_RAIL_OPACITY = 0.3

export const DEFAULT_SELECTION_RECT_COLOR = 'cyan'
export const DEFAULT_SELECTION_RECT_OPACITY = 0.5
