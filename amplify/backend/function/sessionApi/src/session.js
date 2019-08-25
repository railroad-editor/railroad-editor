const aws = require('aws-sdk')
const {COGNITO_IDENTITY_ID_HEADER} = require("./constants");
const dynamoDB = new aws.DynamoDB({'region': 'ap-northeast-1'})

const getTableName = () => `sessions-${process.env.ENV}`

const verifyUserId = (req) => {
  const cognitoIdentityId = req.headers[COGNITO_IDENTITY_ID_HEADER]
  const userIdPathParam = req.params.userId
  console.info(cognitoIdentityId, userIdPathParam)
  return cognitoIdentityId === userIdPathParam
}

const getSessions = async (req, res) => {
  if (! verifyUserId(req)) {
    res.status(403).send()
    return
  }
  const userId = req.params.userId
  dynamoDB.query({
    TableName: getTableName(),
    KeyConditionExpression: "#key= :val",
    ExpressionAttributeValues: { ":val": {S: userId} },
    ExpressionAttributeNames: { "#key": "userId" },
  }, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send()
      return
    }
    if (data.Items == null) {
      res.status(404).send()
      return
    }

    const sessions = data.Items
      .map(item => {
        return {
          userId: item.userId.S,
          layoutId: item.layoutId.S,
          peerId: item.peerId.S,
          timestamp: Number(item.timestamp.N)
        }})
    res.json({sessions})
  })
};

const getSession = async (req, res) => {
  if (! verifyUserId(req)) {
    res.status(403).send()
    return
  }
  const userId = req.params.userId
  const layoutId = req.params.layoutId
  dynamoDB.getItem({
    Key: {
      userId: { S: userId },
      layoutId: { S: layoutId }
    },
    TableName: getTableName()
  }, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send()
      return
    }
    if (data.Item == null) {
      res.status(404).send()
      return
    }
    const session = {
      userId: data.Item.userId.S,
      layoutId: data.Item.layoutId.S,
      peerId: data.Item.peerId.S,
      timestamp: Number(data.Item.timestamp.N)
    }
    res.json(session)
  })
};

const putSession = (req, res) => {
  if (! verifyUserId(req)) {
    res.status(403).send()
    return
  }
  const userId = req.params.userId
  const layoutId = req.params.layoutId
  const peerId = req.body.peerId
  const timestamp = String(new Date().getTime())
  dynamoDB.putItem({
    Item: {
      userId: { S: userId },
      layoutId: { S: layoutId },
      peerId: {S: peerId},
      timestamp: {N: timestamp}
    },
    TableName: getTableName()
  }, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send()
      return
    }
    res.status(204).send()
  })
};
const deleteSession = (req, res) => {
  if (! verifyUserId(req)) {
    res.status(403).send()
    return
  }
  const userId = req.params.userId
  const layoutId = req.params.layoutId
  dynamoDB.deleteItem({
    Key: {
      userId: { S: userId },
      layoutId: { S: layoutId }
    },
    TableName: getTableName()
  }, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send()
      return
    }
    res.status(204).send()
  })
};



module.exports = {
  getSessions,
  getSession,
  putSession,
  deleteSession
}
