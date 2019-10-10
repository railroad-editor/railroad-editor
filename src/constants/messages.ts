import {I18n} from "aws-amplify";

export const REQUIRE_LOGIN = 'Require Login'
export const LOGGED_IN = 'Logged In'
export const LAYOUT_SAVED = 'Layout Saved'
export const LAYOUT_LOADED = 'Layout Loaded'
export const NEW_RAIL_GROUP = 'New Rail Group'
export const NO_RAIL_FOR_GROUP = 'No Rail For Group'
export const NO_REMOTE_SESSION = 'No Session'
export const CONNECTED_REMOTE = 'Connected Remote'
export const BUG_REPORT_SUBMITTED = 'Bug Report Submitted'


export const MESSAGES = {
  'en': {
    [REQUIRE_LOGIN]: 'Please Login first.',
    [LOGGED_IN]: 'Logged in.',
    [LAYOUT_LOADED]: 'Layout loaded.',
    [LAYOUT_SAVED]: 'Layout saved.',
    [NEW_RAIL_GROUP]: (num, name) => `Copied ${num} rails as "${name}" rail group.`,
    [NO_RAIL_FOR_GROUP]: 'Please select at least on rail.',
    [NO_REMOTE_SESSION]: 'Could not connect to remote Railroad Controller.',
    [CONNECTED_REMOTE]: 'Connected to remote Railroad Controller.',
    [BUG_REPORT_SUBMITTED]: 'Your issue is submitted successfully. Thank you for reporting!'
  },
  'ja': {
    [REQUIRE_LOGIN]: 'ログインしてください',
    [LOGGED_IN]: 'ログインしました',
    [LAYOUT_LOADED]: 'レイアウトをロードしました',
    [LAYOUT_SAVED]: 'レイアウトを保存しました',
    [NEW_RAIL_GROUP]: (num, name) => `${num} 個のレールを "${name}" レールグループにコピーしました`,
    [NO_RAIL_FOR_GROUP]: 'レールを１つ以上選択してください',
    [NO_REMOTE_SESSION]: 'コントローラーに接続できませんでした',
    [CONNECTED_REMOTE]: 'コントローラーに接続しました',
    [BUG_REPORT_SUBMITTED]: 'バグレポートを送信しました。ご協力感謝いたします!'
  }
}

I18n.putVocabularies(MESSAGES)