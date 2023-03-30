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

describe("/api/users", () => {
  describe("GET", () => {
    test("200: responds with an array of user objects with 'username', 'name' and 'avatar_url' properties", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body }) => {
          const { users } = body;
          expect(users.length).toBe(4);
          users.forEach((user) => {
            expect(user).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("200: responds with an array of articles containing all rows plus the comment_count ordered by date in descending order when no queries are provided", () => {
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
    test("200: responds with an array of articles ordered by date in ascending order", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(12);
          // Checking order by date
          expect(articles).toBeSortedBy("created_at", { ascending: true });
        });
    });
    test("200: responds with an array of articles filtered by the provided topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(11);
          // Checking object properties
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: "mitch",
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            });
          });
        });
    });
    test("200: responds with an array of articles sorted by the provided column in descending order", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(12);
          // Checking order by date
          expect(articles).toBeSortedBy("author", { descending: true });
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
    test("200: responds with an array of articles sorted by the provided column in ascending order", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(12);
          // Checking order by date
          expect(articles).toBeSortedBy("author", { ascending: true });
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
    test("200: responds with an array of articles filtered by the provided topic and sorted by the provided column in ascending order", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=author&order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(11);
          // Checking order by date
          expect(articles).toBeSortedBy("author", { ascending: true });
          // Checking object properties
          articles.forEach((article) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: expect.any(Number),
              topic: "mitch",
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
              comment_count: expect.any(String),
            });
          });
        });
    });
    test("200: responds with an empty array when topic exists but no articles have the specified topic", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles).toEqual([]);
        });
    });
    test("404: responds with Not Found when topic query does not exist", () => {
      return request(app)
        .get("/api/articles?topic=fake-topic")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: slug does not exist.");
        });
    });
    test("400: responds with Bad Request when sort_by query has invalid column", () => {
      return request(app)
        .get("/api/articles?sort_by=invalid-col")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: Invalid query - invalid-col.");
        });
    });
    test("400: responds with Bad Request when order query has invalid value", () => {
      return request(app)
        .get("/api/articles?order=random")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: Invalid query - random.");
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
          expect(article).toMatchObject({
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
    test("200: responds with an article object with a comment_count property", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toEqual(
            expect.objectContaining({ comment_count: "11" })
          );
        });
    });
    test("404: responds with Not Found when article id does not exist", () => {
      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found: article_id does not exist!");
        });
    });
    test("400: responds with Bad Request when article id is not valid", () => {
      return request(app)
        .get("/api/articles/not-a-num")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
  });
  describe("PATCH", () => {
    test("200: responds with updated article object with the votes incremented by the amount defined in inc_votes", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/articles/1")
        .send(testIncVotes)
        .expect(200)
        .then(({ body }) => {
          const { updatedArticle } = body;
          expect(updatedArticle).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 110,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("200: responds with updated article object with the votes decremented by the amount defined in inc_votes", () => {
      const testIncVotes = { inc_votes: -10 };
      return request(app)
        .patch("/api/articles/1")
        .send(testIncVotes)
        .expect(200)
        .then(({ body }) => {
          const { updatedArticle } = body;
          expect(updatedArticle).toMatchObject({
            article_id: 1,
            title: "Living in the shadow of a great man",
            topic: "mitch",
            author: "butter_bridge",
            body: "I find this existence challenging",
            created_at: expect.any(String),
            votes: 90,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          });
        });
    });
    test("400: responds with Bad Request when article_id is invalid", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/articles/not-a-num")
        .send(testIncVotes)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
    test("404: responds with Bad Request when article_id does not exist", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/articles/9999")
        .send(testIncVotes)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not found: article_id does not exist!");
        });
    });
    test("400: responds with Bad Request when req body does not contain inc_votes property", () => {
      const testIncVotes = {};
      return request(app)
        .patch("/api/articles/1")
        .send(testIncVotes)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when req body inc_votes property contains wrong data type", () => {
      const testIncVotes = { inc_votes: "wrong-data-format" };
      return request(app)
        .patch("/api/articles/1")
        .send(testIncVotes)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
  });
});

describe("/api/comments/:comment_id", () => {
  describe("DELETE", () => {
    test("204: responds with no content when successfully deleted comment by id", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    test("404: responds with Not Found when comment_id does not exist", () => {
      return request(app)
        .delete("/api/comments/9999")
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: comment_id does not exist.");
        });
    });
    test("400: responds with Bad Request when comment_id is invalid", () => {
      return request(app)
        .delete("/api/comments/not-a-num")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
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
        .get("/api/articles/9999/comments")
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
          expect(msg).toBe("Error: invalid data format.");
        });
    });
  });
  describe("POST", () => {
    test("201: responds with the created comment when req body contains a comment object with username and body", () => {
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
    test("201: responds with the created comment when req body contains a comment object with username, body and extra properties", () => {
      const testComment = {
        username: "lurker",
        body: "This is the best article I've read thus far.",
        extra_property: "This is an extra, invalid, property",
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
        .post("/api/articles/9999/comments")
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
          expect(msg).toBe("Error: invalid data format.");
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
