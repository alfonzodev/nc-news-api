const request = require("supertest");
const app = require("../app.js");
const data = require("../db/data/test-data/index.js");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed");
const jwt = require("jsonwebtoken");

// Sing token with existing username
const validUsernameToken = jwt.sign(
  { username: "butter_bridge" },
  process.env.JWT_TOKEN_SECRET,
  { expiresIn: 60 }
);

// Sign token with fake username
const invalidUsernameToken = jwt.sign(
  { username: "fake_user" },
  process.env.JWT_TOKEN_SECRET,
  { expiresIn: 60 }
);

let validToken = "";
let invalidToken = "";

beforeEach(() => {
  validToken = validUsernameToken;
  invalidToken = invalidUsernameToken;
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("/api", () => {
  describe("GET", () => {
    test("200: responds with JSON describing all the available endpoints on your API", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body }) => {
          for (endpoint in body) {
            expect(body[endpoint]).toMatchObject({
              description: expect.any(String),
            });
          }
        });
    });
  });
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
    test("200: responds with an array of user objects", () => {
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
              email: expect.any(String),
              avatar_url: expect.any(String),
            });
          });
        });
    });
  });
});

describe("/api/users/register", () => {
  describe("POST", () => {
    test("201: responds with an object of the newly created user", () => {
      const newUser = {
        username: "test_username",
        name: "Test User",
        email: "test@email.com",
        password: "test123#",
        avatar_url:
          "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toMatchObject({
            username: "test_username",
            name: "Test User",
            email: "test@email.com",
            avatar_url:
              "https://vignette.wikia.nocookie.net/mrmen/images/7/78/Mr-Grumpy-3A.PNG/revision/latest?cb=20170707233013",
          });
        });
    });
    test("201: accepts user object with no avatar_url", () => {
      const newUser = {
        username: "test_username",
        name: "Test User",
        email: "test@email.com",
        password: "test123#",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(201)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toMatchObject({
            username: "test_username",
            name: "Test User",
            email: "test@email.com",
            avatar_url: null,
          });
        });
    });
    test("409: responds with Conflict when username already exists", () => {
      const newUser = {
        username: "butter_bridge",
        name: "Test User",
        email: "test@email.com",
        password: "test123#",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(409)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe(
            "Error: Key (username)=(butter_bridge) already exists."
          );
        });
    });
    test("409: responds with Conflict when email already exists", () => {
      const newUser = {
        username: "test_username",
        name: "Test User",
        email: "jonny@email.com",
        password: "test123#",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(409)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe(
            "Error: Key (email)=(jonny@email.com) already exists."
          );
        });
    });
    test("400: responds with Bad Request when username not provided", () => {
      const newUser = {
        name: "Test User",
        email: "jonny@email.com",
        password: "test123#",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when name not provided", () => {
      const newUser = {
        username: "test_username",
        email: "jonny@email.com",
        password: "test123#",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when email not provided", () => {
      const newUser = {
        username: "test_username",
        name: "Test User",
        password: "test123#",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when password not provided", () => {
      const newUser = {
        username: "test_username",
        name: "Test User",
        email: "jonny@email.com",
      };

      return request(app)
        .post("/api/users/register")
        .send(newUser)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
  });
});

describe("/api/users/login", () => {
  describe("POST", () => {
    test("200: responds with access Json Web Token", () => {
      const userCredentials = {
        email: "jonny@email.com",
        password: "jonny123#",
      };

      return request(app)
        .post("/api/users/login")
        .send(userCredentials)
        .expect(200)
        .then(({ body }) => {
          const { accessToken } = body;
          expect(typeof accessToken).toBe("string");
          const decoded = jwt.verify(accessToken, process.env.JWT_TOKEN_SECRET);
          expect(decoded.username).toBe("butter_bridge");
        });
    });
    test("400: responds with Bad Request if user does not provide email", () => {
      const userCredentials = {
        password: "jonny123#",
      };

      return request(app)
        .post("/api/users/login")
        .send(userCredentials)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: please provide email and password.");
        });
    });
    test("400: responds with Bad Request if user does not provide password", () => {
      const userCredentials = {
        email: "fake@email.com",
      };

      return request(app)
        .post("/api/users/login")
        .send(userCredentials)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: please provide email and password.");
        });
    });
    test("404: responds with Not Found if email does not exist", () => {
      const userCredentials = {
        email: "fake@email.com",
        password: "jonny123#",
      };

      return request(app)
        .post("/api/users/login")
        .send(userCredentials)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: email does not exist.");
        });
    });
    test("401: responds with unauthorized if password does not match", () => {
      const userCredentials = {
        email: "jonny@email.com",
        password: "fakepassword",
      };

      return request(app)
        .post("/api/users/login")
        .send(userCredentials)
        .expect(401)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: password does not match.");
        });
    });
  });
});
describe("/api/users/logout", () => {
  describe("GET", () => {
    test("204: No Content", () => {
      return request(app)
        .get("/api/users/logout")
        .expect(204)
    });
  });
});

describe("/api/users/:username", () => {
  describe("GET", () => {
    test("200: responds with a user object of provided username", () => {
      return request(app)
        .get("/api/users/butter_bridge")
        .set("cookie", `access_token=${validToken}`)
        .expect(200)
        .then(({ body }) => {
          const { user } = body;
          expect(user).toMatchObject({
            username: "butter_bridge",
            name: "jonny",
            email: "jonny@email.com",
            avatar_url:
              "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
          });
        });
    });
    test("404: responds with Not Found if username does not exist", () => {
      return request(app)
        .get("/api/users/fake_username")
        .set("cookie", `access_token=${validToken}`)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: username does not exist.");
        });
    });
  });
});

describe("/api/articles", () => {
  describe("GET", () => {
    test("200: responds with an array of 10 articles by default ordered by date descending", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          expect(articles.length).toBe(10);
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
    test("200: response body contains total_count of articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const { total_count } = body;

          expect(articles.length).toBe(10);
          expect(total_count).toBe("12");
        });
    });
    test("200: responds with an array of articles ordered by date in ascending order", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          const { articles } = body;
          const { total_count } = body;
          expect(articles.length).toBe(10);
          expect(total_count).toBe("12");
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
          const { total_count } = body;
          expect(articles.length).toBe(10);
          expect(total_count).toBe("11");
          expect();
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
          const { total_count } = body;
          expect(articles.length).toBe(10);
          expect(total_count).toBe("12");
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
          const { total_count } = body;
          expect(articles.length).toBe(10);
          expect(total_count).toBe("12");
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
          const { total_count } = body;
          expect(articles.length).toBe(10);
          expect(total_count).toBe("11");
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

    describe("Pagination Queries", () => {
      test("200: responds with an array of 10 articles when 'p' query is set to 1 and 'limit' query is not set", () => {
        return request(app)
          .get("/api/articles?p=1")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(10);
            const { total_count } = body;
            expect(total_count).toBe("12");
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
      test("200: responds with an array of 2 articles when 'p' query is set to 2 and 'limit' query is not set", () => {
        return request(app)
          .get("/api/articles?p=2")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(2);
            const { total_count } = body;
            expect(total_count).toBe("12");
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
      test("200: responds with an array of 5 articles when 'p' query is set to 1 and 'limit' query is set to 5", () => {
        return request(app)
          .get("/api/articles?p=1&limit=5")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(5);
            const { total_count } = body;
            expect(total_count).toBe("12");
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
      test("200: responds with an array of 2 articles when 'p' query is set to 3 and 'limit' query is set to 5", () => {
        return request(app)
          .get("/api/articles?p=3&limit=5")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(2);
            const { total_count } = body;
            expect(total_count).toBe("12");
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
      test("200: responds with an empty array if 'p' query is set higher than the amount of pages able to be filled by the amount of articles", () => {
        return request(app)
          .get("/api/articles?p=99")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(0);
            const { total_count } = body;
            expect(total_count).toBe("12");
          });
      });
      test("400: responds with Bad Request when limit is not a number", () => {
        return request(app)
          .get("/api/articles?p=not_a_num")
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe("Error: Invalid query - not_a_num.");
          });
      });
      test("400: responds with Bad Request when p is not a number", () => {
        return request(app)
          .get("/api/articles?p=not_a_num")
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe("Error: Invalid query - not_a_num.");
          });
      });
    });
  });
  describe("POST", () => {
    test("201: responds with the newly added article plus a comment count property", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Cats are cute",
        body: "Cats are extremely cute.",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: "butter_bridge",
            title: "Cats are cute",
            body: "Cats are extremely cute.",
            topic: "cats",
            article_img_url:
              "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });
    test("201: responds with the newly added article and default article_image_url when none provided", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Cats are cute",
        body: "Cats are extremely cute.",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            author: "butter_bridge",
            title: "Cats are cute",
            body: "Cats are extremely cute.",
            topic: "cats",
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            votes: 0,
            created_at: expect.any(String),
            comment_count: 0,
          });
        });
    });
    test("404: responds with Not Found when author in new article does not exist ", () => {
      const newArticle = {
        author: "fake_author",
        title: "Cats are cute",
        body: "Cats are extremely cute.",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: author does not exist.");
        });
    });
    test("404: responds with Not Found when topic in new article does not exist ", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Cats are cute",
        body: "Cats are extremely cute.",
        topic: "fake-topic",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: topic does not exist.");
        });
    });
    test("400: responds with Bad Request when new article title is empty", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "",
        body: "Cats are extremely cute.",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when new article body is empty", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Cats are cute",
        body: "",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when new article has no title property", () => {
      const newArticle = {
        author: "butter_bridge",
        body: "Cats are extremely cute.",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when new article has no body property", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Cats are cute",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when new article has no topic property", () => {
      const newArticle = {
        author: "butter_bridge",
        title: "Cats are cute",
        body: "Cats are extremely cute.",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
        });
    });
    test("400: responds with Bad Request when new article has no author property", () => {
      const newArticle = {
        title: "Cats are cute",
        body: "Cats are extremely cute.",
        topic: "cats",
        article_img_url:
          "https://images.unsplash.com/photo-1561948955-570b270e7c36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=601&q=80",
      };
      return request(app)
        .post("/api/articles")
        .set("cookie", `access_token=${validToken}`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: missing information.");
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
          expect(msg).toBe("Not Found: article_id does not exist.");
        });
    });
    test("400: responds with Bad Request when article id is not a number", () => {
      return request(app)
        .get("/api/articles/not-a-num")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
    test("400: responds with Bad Request when article id is too large to be an integer", () => {
      return request(app)
        .get("/api/articles/2147483648")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: value out of bounds.");
        });
    });
  });
  describe("PATCH", () => {
    test("200: responds with updated article object with the votes incremented by the amount defined in inc_votes", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/articles/1")
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
        .send(testIncVotes)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: article_id does not exist.");
        });
    });
    test("400: responds with Bad Request when req body does not contain inc_votes property", () => {
      const testIncVotes = {};
      return request(app)
        .patch("/api/articles/1")
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
      return request(app)
        .delete("/api/comments/1")
        .set("cookie", `access_token=${validToken}`)
        .expect(204);
    });
    test("404: responds with Not Found when comment_id does not exist", () => {
      return request(app)
        .delete("/api/comments/9999")
        .set("cookie", `access_token=${validToken}`)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: comment_id does not exist.");
        });
    });
    test("400: responds with Bad Request when comment_id is invalid", () => {
      return request(app)
        .delete("/api/comments/not-a-num")
        .set("cookie", `access_token=${validToken}`)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
    test("401: responds with Unauthorized when logged in user is not author of comment", () => {
      return request(app)
        .delete("/api/comments/1")
        .set("cookie", `access_token=${invalidToken}`)
        .expect(401)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe(
            "Error: Unauthorized - user is not author of comment."
          );
        });
    });
  });
  describe("PATCH", () => {
    test("200: responds with updated comment object with the votes incremented by the amount defined in inc_votes", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/comments/1")
        .set("cookie", `access_token=${validToken}`)
        .send(testIncVotes)
        .expect(200)
        .then(({ body }) => {
          const { updatedComment } = body;
          expect(updatedComment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: 26,
            author: "butter_bridge",
            article_id: 9,
            created_at: expect.any(String),
          });
        });
    });
    test("200: responds with updated comment object with the votes decremented by the amount defined in inc_votes", () => {
      const testIncVotes = { inc_votes: -20 };
      return request(app)
        .patch("/api/comments/1")
        .set("cookie", `access_token=${validToken}`)
        .send(testIncVotes)
        .expect(200)
        .then(({ body }) => {
          const { updatedComment } = body;
          expect(updatedComment).toMatchObject({
            comment_id: 1,
            body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
            votes: -4,
            author: "butter_bridge",
            article_id: 9,
            created_at: expect.any(String),
          });
        });
    });
    test("400: responds with Bad Request when comment_id is invalid", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/comments/not-a-num")
        .set("cookie", `access_token=${validToken}`)
        .send(testIncVotes)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
    test("404: responds with Not Found when comment_id does not exist", () => {
      const testIncVotes = { inc_votes: 10 };
      return request(app)
        .patch("/api/comments/9999")
        .set("cookie", `access_token=${validToken}`)
        .send(testIncVotes)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Not Found: comment_id does not exist.");
        });
    });
    test("400: responds with Bad Request when req body does not contain inc_votes property", () => {
      const testIncVotes = {};
      return request(app)
        .patch("/api/comments/1")
        .set("cookie", `access_token=${validToken}`)
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
        .patch("/api/comments/1")
        .set("cookie", `access_token=${validToken}`)
        .send(testIncVotes)
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
    test("200: responds with an array of 10 comments by default, ordered by creation date in descending order", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body }) => {
          const { comments } = body;
          expect(comments.length).toBe(10);
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
    test("400: responds with Bad Request if article id is not a number", () => {
      return request(app)
        .get("/api/articles/not-a-num/comments")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: invalid data format.");
        });
    });
    test("400: responds with Bad Request if article id num is too large to be an integer", () => {
      return request(app)
        .get("/api/articles/2147483648/comments")
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;
          expect(msg).toBe("Error: value out of bounds.");
        });
    });
    describe("Pagination Queries", () => {
      test("200: responds with an array of 10 comments when 'p' query is set to 1 and 'limit' query is not set", () => {
        return request(app)
          .get("/api/articles/1/comments?p=1")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(10);

            // Checking order by date
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
      test("200: responds with an array of 1 comment when 'p' query is set to 2 and 'limit' query is not set", () => {
        return request(app)
          .get("/api/articles/1/comments?p=2")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(1);
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
      test("200: responds with an array of 5 comments when 'p' query is set to 1 and 'limit' query is set to 5", () => {
        return request(app)
          .get("/api/articles/1/comments?p=1&limit=5")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(5);

            // Checking order by date
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
      test("200: responds with an array of 1 comment when 'p' query is set to 3 and 'limit' query is set to 5", () => {
        return request(app)
          .get("/api/articles/1/comments?p=3&limit=5")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(1);
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
      test("200: responds with an empty array if 'p' query is set higher than the amount of pages able to be filled by the amount of comments", () => {
        return request(app)
          .get("/api/articles/1/comments?p=99")
          .expect(200)
          .then(({ body }) => {
            const { comments } = body;
            expect(comments.length).toBe(0);
          });
      });
      test("400: responds with Bad Request when limit is not a number", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=not_a_num")
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe("Error: Invalid query - not_a_num.");
          });
      });
      test("400: responds with Bad Request when p is not a number", () => {
        return request(app)
          .get("/api/articles/1/comments?p=not_a_num")
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;
            expect(msg).toBe("Error: Invalid query - not_a_num.");
          });
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        .set("cookie", `access_token=${validToken}`)
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
        expect(msg).toBe("Not Found.");
      });
  });
});

describe("Authentication Middleware (protected routes)", () => {
  test("401: responds with Unauthorized when trying to access protected route without jwt", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(401)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Error: Not authorized.");
      });
  });
  test("403: responds with Forbidden when trying to access protected route with invalid jwt", () => {
    return request(app)
      .get("/api/users/rogersop")
      .set("cookie", `access_token=invalid_token`)
      .expect(403)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Error: invalid token.");
      });
  });
});
