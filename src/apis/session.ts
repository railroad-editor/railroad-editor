import {API} from "aws-amplify";

export interface Sessions {
  sessions: number[]
}

export interface Session {
  layoutId: string
  peerId: string
  timestamp: number
}

const fetchSessions = async (userId: string): Promise<Sessions> => {
  return await API.get('layout', `/users/${userId}/sessions`, {headers: {}})
}

const fetchSession = async (userId: string, layoutId: string): Promise<Session> => {
  return await API.get('layout', `/users/${userId}/sessions/${layoutId}`, {headers: {}})
}

const createSession = async (userId: string, layoutId: string, peerId: string) => {
  return await API.put('layout', `/users/${userId}/sessions/${layoutId}`, {
    headers: {'Content-Type': 'application/json'},
    body: {
      peerId,
    }
  })
}

const deleteSession = async (userId: string, layoutId: string) => {
  return await API.del('Layout', `/users/${userId}/sessions/${layoutId}`, {headers: {}})
}


export default {
  fetchSessions,
  fetchSession,
  createSession,
  deleteSession,
}
