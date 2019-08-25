var chai = require('chai')
var chaiHttp = require('chai-http')
var app = require('./app')
var expect = chai.expect
// Configure chai
chai.use(chaiHttp);

describe("Issue API", () => {
  it("post a new issue", async () => {
    const res = await chai.request(app)
      .post('/issues')
      .send({
        title: 'aaa',
        body: 'this is test',
        label: 'bug'
      })
    expect(res.status).to.equal(204)
  });
})

