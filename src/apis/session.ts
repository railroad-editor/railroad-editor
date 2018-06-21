import {API} from "aws-amplify";
import * as moment from "moment";


export interface Session {
  layoutId: string
  peerId: string
  timestamp: number
}

const fetchSession = async (userId: string): Promise<Session> => {
  const result = await API.get('Layout', `/users/${userId}/session`, {headers: {}})
  return result
}

const createSession = async (userId: string, layoutId: string, peerId: string) => {
  return await API.put('Layout', `/users/${userId}/session`, {
    headers: {},
    body: {
      layoutId,
      peerId,
      timestamp: moment.valueOf()
    }
  })
}

const deleteSession =  async (userId: string) => {
  return await API.del('Layout', `/users/${userId}/session`, {headers: {}})
}


export default {
  fetchSession,
  createSession,
  deleteSession,
}
