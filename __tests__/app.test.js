const request = require("supertest");
const app = require("../app.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api/topics", () => {
  describe("GET", () => {
    test("200: responds with an array of all topic objects", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(topic).toMatchObject({
              slug: expect.any(String),
              description: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("200: responds with an array of articles containing all rows plus the comment_count ordered by date in descending order", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(12);
          // Checking order by date
          expect(articles).toBeSortedBy("created_at", { descending: true });
          // Checking object properties
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("200: responds with an article object", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual({
            article_id: 1,
            title: "Living in the shadow of a great man",
            author: "butter_bridge",
            body: "I find this existence challenging",
            topic: "mitch",
            created_at: "2020-07-09T20:11:00.000Z",
            votes: 100,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("404: responds with Not Found when article id does not exist", () => {
      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: Article does not exist!");
        });
    });
    test("400: responds with Bad Request when article id is not valid", () => {
      return request(app)
        .get("/api/articles/not-a-num")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid article id!");
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("200: responds with an array of comments for the given article_id ordered by creation date in descending order", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(11);
          // Checking order
          expect(comments).toBeSortedBy("created_at", { descending: true });
          // Checking object properties
          comments.forEach((comment) => {
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        });
    });
    test("200: responds with an empty array when given article_id is valid but the article has no comments", () => {
      return request(app)
        .get("/api/articles/8/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments).toEqual([]);
        });
    });
    test("404: responds with Not Found if article_id does not exist", () => {
      return request(app)
        .get("/api/articles/300/comments")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: article_id does not exist.");
        });
    });
    test("400: responds with Bad Request if article id is invalid", () => {
      return request(app)
        .get("/api/articles/not-a-num/comments")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid article id!");
        });
    });
  });
});

describe("/api/articles/:article_id/comments", () => {
  describe("POST", () => {
    test("201: responds with the created comment", () => {
      const testComment = {
        username: "lurker",
        body: "This is the best article I've read thus far.",
      };
      return request(app)
        .post("/api/articles/8/comments")
        .send(testComment)
        .expect(201)
        .then(({ body }) => {
          const { comment } = body;
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            body: testComment.body,
            article_id: 8,
            author: testComment.username,
            votes: 0,
            created_at: expect.any(String),
          });
        });
    });
    test("404: responds with Not Found when provided a non-existing article_id", () => {
      const testComment = {
        username: "lurker",
        body: "This is the best article I've read thus far.",
      };
      return request(app)
        .post("/api/articles/300/comments")
        .send(testComment)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: article_id does not exist.");
        });
    });
    test("400: responds with Bad Request when provided an invalid article_id", () => {
      const testComment = {
        username: "lurker",
        body: "This is the best article I've read thus far.",
      };
      return request(app)
        .post("/api/articles/not-a-number/comments")
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Invalid article id!");
        });
    });
    test("404: responds with Not Found when username in request body does not exist", () => {
      const testComment = {
        username: "fakeUsername",
        body: "This is the best article I've read thus far.",
      };
      return request(app)
        .post("/api/articles/8/comments")
        .send(testComment)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: username does not exist.");
        });
    });
    test("400: responds with Bad Request when NO username is provided in request body", () => {
      const testComment = {
        body: "This is the best article I've read thus far.",
      };
      return request(app)
        .post("/api/articles/8/comments")
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when comment body in request body is an empty string", () => {
      const testComment = {
        username: "lurker",
        body: "",
      };
      return request(app)
        .post("/api/articles/8/comments")
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: empty comment.");
        });
    });
    test("400: responds with Bad Request when NO comment body is provided in request body", () => {
      const testComment = {
        username: "lurker",
      };
      return request(app)
        .post("/api/articles/8/comments")
        .send(testComment)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
  });
});

describe("Handle invalid endpoints", () => {
  test("responds with 404 Not Found when provided an invalid endpoint", () => {
    return request(app)
      .get("/api/banana")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not found!");
      });
  });
});
