import {API} from "aws-amplify";

export interface Issue {
  type: string
  title: string
  comment: string
}

export interface Session {
  layoutId: string
  peerId: string
  timestamp: number
}

const ISSUE_LABELS = [
  'Bug', 'Feature Request',
]


const createIssue = async (issue: Issue): Promise<Issue> => {
  return await API.put('Layout', `/issues`, {
    headers: {'Content-Type': 'application/json'},
    body: {
      title: issue.title,
      body: issue.comment,
      label: ISSUE_LABELS.includes(issue.type) ? issue.type.toLowerCase() : null
    }
  })
}

export default {
  createIssue,
}
