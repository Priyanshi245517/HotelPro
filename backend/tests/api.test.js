const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");
let mongo, app, User, Room, Booking, guestToken, staffToken, adminToken, guestId, room;

before(async () => {
  process.env.JWT_SECRET = "test-only-secret-long-enough";
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  app = require("../src/app");
  User = require("../src/models/User"); Room = require("../src/models/Room"); Booking = require("../src/models/Booking");
});
after(async () => { await mongoose.disconnect(); await mongo.stop(); });
beforeEach(async () => {
  await Promise.all([User.deleteMany({}), Room.deleteMany({}), Booking.deleteMany({})]);
  const g = await User.create({ name:"Guest", email:"guest@test.local", password:"password123", role:"guest" });
  const s = await User.create({ name:"Staff", email:"staff@test.local", password:"password123", role:"staff" });
  const a = await User.create({ name:"Admin", email:"admin@test.local", password:"password123", role:"admin" });
  const jwt = require("jsonwebtoken");
  guestId = g._id.toString();
  guestToken = jwt.sign({userId:g._id}, process.env.JWT_SECRET);
  staffToken = jwt.sign({userId:s._id}, process.env.JWT_SECRET);
  adminToken = jwt.sign({userId:a._id}, process.env.JWT_SECRET);
  room = await Room.create({ roomNumber:"101", type:"Deluxe", pricePerNight:2500, capacity:2 });
});
test("health endpoint responds", async () => {
  const res = await request(app).get("/api/health");
  assert.equal(res.status, 200); assert.equal(res.body.status, "ok");
});
test("guest cannot create rooms; staff can", async () => {
  const payload = {roomNumber:"102",type:"Standard",pricePerNight:1000,capacity:2};
  assert.equal((await request(app).post("/api/rooms").set("Authorization",`Bearer ${guestToken}`).send(payload)).status,403);
  assert.equal((await request(app).post("/api/rooms").set("Authorization",`Bearer ${staffToken}`).send(payload)).status,201);
});
test("admin alone can deactivate rooms", async () => {
  assert.equal((await request(app).delete(`/api/rooms/${room._id}`).set("Authorization",`Bearer ${staffToken}`)).status,403);
  assert.equal((await request(app).delete(`/api/rooms/${room._id}`).set("Authorization",`Bearer ${adminToken}`)).status,200);
});
test("booking calculates price and rejects overlapping dates", async () => {
  const payload = {roomId:room._id.toString(),checkIn:"2030-05-01",checkOut:"2030-05-03",numberOfGuests:2};
  const first = await request(app).post("/api/bookings").set("Authorization",`Bearer ${guestToken}`).send(payload);
  assert.equal(first.status,201); assert.equal(first.body.booking.totalPrice,5000);
  const overlap = await request(app).post("/api/bookings").set("Authorization",`Bearer ${guestToken}`).send({...payload,checkIn:"2030-05-02",checkOut:"2030-05-04"});
  assert.equal(overlap.status,409);
});
test("booking rejects guest counts above room capacity", async () => {
  const res = await request(app).post("/api/bookings").set("Authorization",`Bearer ${guestToken}`).send({roomId:room._id.toString(),checkIn:"2030-05-01",checkOut:"2030-05-02",numberOfGuests:3});
  assert.equal(res.status,400);
});
test("guest only sees own bookings; cancellation frees dates", async () => {
  const created = await Booking.create({guest:guestId,room:room._id,checkIn:new Date("2030-05-01"),checkOut:new Date("2030-05-02"),numberOfGuests:1,totalPrice:2500});
  const list = await request(app).get("/api/bookings").set("Authorization",`Bearer ${guestToken}`);
  assert.equal(list.status,200); assert.equal(list.body.bookings.length,1);
  const cancel = await request(app).patch(`/api/bookings/${created._id}/cancel`).set("Authorization",`Bearer ${guestToken}`);
  assert.equal(cancel.status,200); assert.equal(cancel.body.booking.status,"cancelled");
});
