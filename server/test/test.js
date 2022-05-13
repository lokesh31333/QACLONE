var supertest = require("supertest");
var should = require("should");

var server = supertest.agent("http://localhost:4000/api/v1");

describe("Get tags", function () {
  it("return all tags", function (done) {
    // calling fav page api with right userid
    server
      .get("/tags")
      .expect("Content-type", /json/)
      .expect(200) // THis is HTTP response
      .end(function (err, res) {
        res.body.should.not.equal(null);
        const checkOne = res.body[0]

        checkOne.should.have.property("tagName")
        checkOne.should.have.property("count")
        // console.log(res.body)
        done();
      });
  });
});

describe("Get messages of user who interacted", function () {
  it("do not return messages if invalid token", function (done) {
    // calling fav page api with right userid
    server
      .get("/messages")
      .expect("Content-type", /json/)
      .set('Authorization', "Bearer" +
        " eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyN2RlOWFiMTY0N2QyM2MxNDkyMTZiOSIsImlhdCI6MTY1MjQ3MDI1NH0.f-d7pWPnQT8iP8dDz6LdX1i0qymXZ-QliBULV5Hdc4Q")
      .expect(200) // THis is HTTP response
      .end(function (err, res) {
        res.body.should.not.equal(null);
        res.body.should.equal("invalid token")
        done();
      });
  });

  it("do not return messages if invalid token", function (done) {
    // calling fav page api with right userid
    server
      .get("/messages")
      .expect("Content-type", /json/)
      .set('Authorization', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyN2RlOWFiMTY0N2QyM2MxNDkyMTZiOSIsImlhdCI6MTY1MjQ3MDYyMH0.PqIbTWaCCCoLbVytBQ_P6DQ50hf7Eu8gXL3V1OoDO3E")
      .expect(200) // THis is HTTP response
      .end(function (err, res) {
        res.body.should.not.equal(null);
        const checkOne = res.body[0]
        checkOne.should.have.property("username")
        checkOne.should.have.property("id")
        done();
      });
  });
});


describe("Get all users", function () {
  it("return all users and verify if necessary properties are present", function (done) {
    // calling fav page api with right userid
    server
      .get("/users/all")
      .expect("Content-type", /json/)
      .expect(200) // THis is HTTP response
      .end(function (err, res) {
        res.body.should.not.equal(null);
        const checkOne = res.body[0]

        checkOne.should.have.property("username")
        checkOne.should.have.property("createdAt")
        checkOne.should.have.property("id")
        // console.log(res.body)
        done();
      });
  });
});


describe("Get all pending question for admin only", function () {
  it("return all questions for admin", function (done) {
    // calling fav page api with right userid
    server
      .get("/questions")
      .expect("Content-type", /json/)
      .expect(200) // THis is HTTP response
      .end(function (err, res) {
        res.body.should.not.equal(null);
        const checkOne = res.body.questions[0]
        console.log(res.body)
        checkOne.should.have.property("tags")
        checkOne.should.have.property("points")
        checkOne.should.have.property("downvotedBy")
        checkOne.should.have.property("views")
        //view must not be empty
        checkOne.views.should.not.equal(null)
        done();
      });
  });
});
