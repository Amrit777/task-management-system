// backend/tests/auth.test.js
const request = require("supertest");
const app = require("../app");
const { connectDB, sequelize } = require("../config/db");

beforeAll(async () => {
  await connectDB();
  // Isolated schema for the test run.
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("Authentication", () => {
  const creds = { name: "Test User", email: "test@example.com", password: "password123" };

  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send(creds);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.role).toEqual("developer");
  });

  it("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send(creds);
    expect(res.statusCode).toEqual(400);
  });

  it("rejects weak passwords", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "X", email: "weak@example.com", password: "123" });
    expect(res.statusCode).toEqual(400);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: creds.email, password: creds.password });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
  });

  it("rejects bad credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: creds.email, password: "wrongpass" });
    expect(res.statusCode).toEqual(401);
  });

  it("blocks unauthenticated access to protected routes", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toEqual(401);
  });
});
