// backend/tests/authorization.test.js
// Regression test for the headline IDOR vulnerability: one user must not be
// able to read, modify, or delete another user's task.
const request = require("supertest");
const app = require("../app");
const { connectDB, sequelize } = require("../config/db");

let tokenA;
let tokenB;
let taskId;

const reg = (email) =>
  request(app).post("/api/auth/register").send({ name: email, email, password: "password123" });

beforeAll(async () => {
  await connectDB();
  await sequelize.sync({ force: true });
  tokenA = (await reg("alice@example.com")).body.token;
  tokenB = (await reg("bob@example.com")).body.token;

  const res = await request(app)
    .post("/api/tasks")
    .set("Authorization", `Bearer ${tokenA}`)
    .send({ title: "Alice private task" });
  taskId = res.body.id;
});

afterAll(async () => {
  await sequelize.close();
});

describe("Task authorization (IDOR protection)", () => {
  it("lets the owner read their task", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.statusCode).toEqual(200);
  });

  it("forbids another user from reading the task", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.statusCode).toEqual(403);
  });

  it("forbids another user from updating the task", async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ title: "hijacked" });
    expect(res.statusCode).toEqual(403);
  });

  it("forbids another user from deleting the task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.statusCode).toEqual(403);
  });

  it("excludes other users' tasks from the list", async () => {
    const res = await request(app).get("/api/tasks").set("Authorization", `Bearer ${tokenB}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.find((t) => t.id === taskId)).toBeUndefined();
  });

  it("rejects mass assignment of createdBy on update", async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "renamed", createdBy: 9999 });
    expect(res.statusCode).toEqual(200);
    // createdBy must be unchanged despite being in the payload.
    const check = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(check.body.createdByUser.id).not.toEqual(9999);
  });
});
