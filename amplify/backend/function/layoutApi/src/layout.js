const aws = require('aws-sdk')
const {COGNITO_IDENTITY_ID_HEADER} = require("./constants");
const dynamoDB = new aws.DynamoDB({'region': 'ap-northeast-1'})

const getTableName = () => `layouts-${process.env.ENV}`

const verifyUserId = (req) => {
  const cognitoIdentityId = req.headers[COGNITO_IDENTITY_ID_HEADER]
  const userIdPathParam = req.params.userId
  console.info(cognitoIdentityId, userIdPathParam)
  return cognitoIdentityId === userIdPathParam
}

const getLayouts = async (req, res) => {
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
    const layouts = data.Items
      .map(item => JSON.parse(item.layoutData.S))
    res.json({layouts})
  })
};

const getLayout = async (req, res) => {
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
    const layoutData = JSON.parse(data.Item.layoutData.S)
    res.json(layoutData)
  })
};

const putLayout = (req, res) => {
  if (! verifyUserId(req)) {
    res.status(403).send()
    return
  }
  const userId = req.params.userId
  const layoutId = req.params.layoutId
  const layoutData = JSON.stringify(req.body)
  dynamoDB.putItem({
    Item: {
      userId: { S: userId },
      layoutId: { S: layoutId },
      layoutData: {S: layoutData}
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
const deleteLayout = (req, res) => {
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
  getLayouts,
  getLayout,
  putLayout,
  deleteLayout
}