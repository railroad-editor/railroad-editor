process.env.ENV = 'test'
var chai = require('chai')
var chaiHttp = require('chai-http')
var app = require('./app')
const {COGNITO_IDENTITY_ID_HEADER} = require("./constants");
var expect = chai.expect
// Configure chai
chai.use(chaiHttp);

describe("user ID verification", () => {
  describe("getLayouts", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app)
        .get('/users/1234/layouts')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
      expect(res.status).to.equal(403)
    });
  })
  describe("getLayout", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app).get('/users/1234/layouts/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
      expect(res.status).to.equal(403)
    });
  })
  describe("putLayout", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app)
        .put('/users/1234/layouts/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
        .send({layout: {a: 1}})
      expect(res.status).to.equal(403)
    });
  })
  describe("deleteLayout", () => {
    it("fails without identity", async () => {
      const res = await chai.request(app)
        .delete('/users/1234/layouts/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '5678')
      expect(res.status).to.equal(403)
    });
  })
})

describe("when no layout exists", () => {
  describe("getLayouts", () => {
    it("gets an empty layout list", async () => {
      const res = await chai.request(app)
        .get('/users/1234/layouts')
        .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      expect(res.status).to.equal(200)
      expect(res.body).to.deep.equal({layouts: []})
    });
  })
  describe("getLayout", () => {
    it("gets no layout", async () => {
      const res = await chai.request(app)
        .get('/users/1234/layouts/abcd')
        .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      expect(res.status).to.equal(404)
    });
  })
})

describe("put & get layouts", () => {
  it("puts new layout", async () => {
    const res = await chai.request(app)
      .put('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      .send({layout: {a: 1}})
    expect(res.status).to.equal(204)
  });

  it("gets the new layout", async () => {
    const res = await chai.request(app)
      .get('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.include({layout: {a: 1}})
  });

  it("updates an existing layout", async () => {
    const res = await chai.request(app)
      .put('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      .send({layout: {b: 2}})
    expect(res.status).to.equal(204)
  });

  it("gets the updated layout", async () => {
    const res = await chai.request(app)
      .get('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({layout: {b: 2}})
  });

  it("puts one more layout", async () => {
    const res = await chai.request(app)
      .put('/users/1234/layouts/efgh')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
      .send({layout: {c: 3}})
    expect(res.status).to.equal(204)
  });

  it("get all layouts", async () => {
    const res = await chai.request(app)
      .get('/users/1234/layouts')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body.layouts).to.deep.include({layout: {b: 2}})
    expect(res.body.layouts).to.deep.include({layout: {c: 3}})
  });
})


describe("delete & get layout", () => {
  it("deletes a layout", async () => {
    const res = await chai.request(app)
      .delete('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(204)
  });

  it("no longer get the layout", async () => {
    const res = await chai.request(app)
      .get('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(404)
  });

  it("deletes the same layout again", async () => {
    const res = await chai.request(app)
      .delete('/users/1234/layouts/abcd')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(204)
  });

  it("deletes one more layout", async () => {
    const res = await chai.request(app)
      .delete('/users/1234/layouts/efgh')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
  });

  it("gets an empty layout list", async () => {
    const res = await chai.request(app)
      .get('/users/1234/layouts')
      .set(COGNITO_IDENTITY_ID_HEADER, '1234')
    expect(res.status).to.equal(200)
    expect(res.body).to.deep.equal({layouts: []})
  });
})