// TODO: use dev env
process.env.ENV = 'test'
var chai = require('chai')
var chaiHttp = require('chai-http')
var app = require('./app')
const {COGNITO_IDENTITY_ID_HEADER} = require("./constants");
var expect = chai.expect
// Configure chai
chai.use(chaiHttp);

describe("user ID verification", () => {
  describe("getSessions", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app)
        .get('/users/1234/sessions')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
      expect(res.status).to.equal(403)
    });
  })
  describe("getSession", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app).get('/users/1234/sessions/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
      expect(res.status).to.equal(403)
    });
  })
  describe("putSession", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app)
        .put('/users/1234/sessions/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
        .send({peerId: 'asdf', timestamp: 9876})
      expect(res.status).to.equal(403)
    });
  })
  describe("deleteSession", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app)
        .delete('/users/1234/sessions/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
      expect(res.status).to.equal(403)
    });
  })
})

describe("when no session exists", () => {
  describe("getSessions", () => {
    it("gets an empty session list", async () => {
      const res = await chai.request(app)
        .get('/users/1234/sessions')
        .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({sessions: []})
    });
  })
  describe("getSession", () => {
    it("gets no session", async () => {
      const res = await chai.request(app)
        .get('/users/1234/sessions/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      expect(res.status).to.equal(404)
    });
  })
})

describe("put & get sessions", () => {

  const SESSION_DATA = [
    {peerId: 'asdf'},
    {peerId: 'ghjk'},
    {peerId: 'qwer'},
  ]

  it("puts new session", async () => {
    const res = await chai.request(app)
      .put('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      .send(SESSION_DATA[0])
    expect(res.status).to.equal(204)
  });

  it("gets the new session", async () => {
    const res = await chai.request(app)
      .get('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.include({ ...SESSION_DATA[0], userId: '1234', layoutId: 'abcd'})
  });

  it("updates an existing session", async () => {
    const res = await chai.request(app)
      .put('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      .send(SESSION_DATA[1])
    expect(res.status).to.equal(204)
  });

  it("gets the updated session", async () => {
    const res = await chai.request(app)
      .get('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.include({ ...SESSION_DATA[1], userId: '1234', layoutId: 'abcd' })
  });

  it("puts one more session", async () => {
    const res = await chai.request(app)
      .put('/users/1234/sessions/efgh')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      .send(SESSION_DATA[2])
    expect(res.status).to.equal(204)
  });

  it("get all sessions", async () => {
    const res = await chai.request(app)
      .get('/users/1234/sessions')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body.sessions.find(s => s.peerId === SESSION_DATA[1].peerId))
      .to.deep.include({ ...SESSION_DATA[1], userId: '1234', layoutId: 'abcd' })
    expect(res.body.sessions.find(s => s.peerId === SESSION_DATA[2].peerId))
      .to.deep.include({ ...SESSION_DATA[2], userId: '1234', layoutId: 'efgh' })
  });
})


describe("delete & get session", () => {
  it("deletes a session", async () => {
    const res = await chai.request(app)
      .delete('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(204)
  });

  it("no longer get the session", async () => {
    const res = await chai.request(app)
      .get('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(404)
  });

  it("deletes the same session again", async () => {
    const res = await chai.request(app)
      .delete('/users/1234/sessions/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(204)
  });

  it("deletes one more session", async () => {
    const res = await chai.request(app)
      .delete('/users/1234/sessions/efgh')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
  });

  it("gets an empty session list", async () => {
    const res = await chai.request(app)
      .get('/users/1234/sessions')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({sessions: []})
  });
})