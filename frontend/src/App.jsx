
import React, { useEffect, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./context";
import api from "./api";

function Shell({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="top">
        <Link className="brand" to="/">
          HOTEL<span>PRO</span>
          <small>THE ART OF STAYING</small>
        </Link>

        <nav>
          <Link to="/">Overview</Link>
          <Link to="/rooms">Rooms</Link>
          {user && <Link to="/bookings">Bookings</Link>}
          {user && ["admin", "staff"].includes(user.role) && (
            <Link to="/manage">Manage</Link>
          )}
        </nav>

        <div className="account">
          {user ? (
            <>
              <span>{user.name} · {user.role}</span>
              <button className="ghost" onClick={logout}>Sign out</button>
            </>
          ) : (
            <Link className="button small" to="/login">Sign in</Link>
          )}
        </div>
      </header>

      <main>{children}</main>
      <footer>HOTELPRO <span>·</span> A MORE BEAUTIFUL WAY TO STAY</footer>
    </div>
  );
}

function Protected({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="muted">Loading your stay...</p>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
}

function AuthPage({ mode }) {
  const { login, register } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    bootstrapSecret: ""
  });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      nav("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <section className="auth panel">
      <p className="eyebrow">WELCOME TO HOTELPRO</p>
      <h1>
        {mode === "login"
          ? "Your next stay starts here."
          : "Make yourself at home."}
      </h1>

      <form onSubmit={submit}>
        {mode === "register" && (
          <input
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password (8+ characters)"
          minLength="8"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {mode === "register" && (
          <input
            type="password"
            placeholder="Admin setup key (only for first admin)"
            value={form.bootstrapSecret}
            onChange={(e) =>
              setForm({ ...form, bootstrapSecret: e.target.value })
            }
          />
        )}

        {error && <p className="error">{error}</p>}
        <button className="button">
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="muted">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link to={mode === "login" ? "/register" : "/login"}>
          {mode === "login" ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </section>
  );
}

function Home() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    api.get("/rooms")
      .then((r) => setRooms(r.data.rooms))
      .catch(() => {});
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A LITTLE MORE LUXURY</p>
          <h1>Stay somewhere<br /><em>extraordinary.</em></h1>
          <p className="lead">
            Thoughtful rooms. Effortless reservations. A stay worth remembering.
          </p>
          <div className="actions">
            <Link className="button" to="/rooms">Explore rooms</Link>
            {!user && (
              <Link className="textlink" to="/register">Join HotelPro ↗</Link>
            )}
          </div>
        </div>

        <div className="hero-art">
          <div className="art-glow"></div>
          <div className="art-caption">
            THE SUITE LIFE <span>01 / 04</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <p className="eyebrow">CURATED FOR COMFORT</p>
            <h2>Rooms with a point of view.</h2>
          </div>
          <Link className="textlink" to="/rooms">View all rooms ↗</Link>
        </div>

        <div className="room-grid">
          {rooms.slice(0, 3).map((r) => (
            <RoomCard key={r._id} room={r} />
          ))}
        </div>

        {!rooms.length && (
          <p className="muted">Our rooms will appear here once the team adds them.</p>
        )}
      </section>
    </>
  );
}

function RoomCard({ room }) {
  return (
    <article className="room-card">
      <div className="room-visual">
        <span>{room.type}</span>
        <b>HP</b>
      </div>

      <div className="room-info">
        <div>
          <h3>Room {room.roomNumber}</h3>
          <p>
            {room.description ||
              room.amenities?.join(" · ") ||
              "A comfortable place to unwind."}
          </p>
        </div>

        <strong>
          ₹{Number(room.pricePerNight).toLocaleString("en-IN")}
          <small> / night</small>
        </strong>
      </div>

      <p className="muted">Up to {room.capacity} guests</p>
    </article>
  );
}

function Rooms() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/rooms")
      .then((r) => setRooms(r.data.rooms))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <section className="section">
      <p className="eyebrow">THE COLLECTION</p>
      <h1>Find your room.</h1>
      <p className="lead">Comfort, considered down to the last detail.</p>

      {error && <p className="error">{error}</p>}

      <div className="room-grid">
        {rooms.map((r) => (
          <div key={r._id}>
            <RoomCard room={r} />
            {user && (
              <Link className="button small" to={`/book?room=${r._id}`}>
                Reserve this room
              </Link>
            )}
          </div>
        ))}
      </div>

      {!rooms.length && (
        <p className="muted">No active rooms are listed yet.</p>
      )}
    </section>
  );
}

function BookingForm() {
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomId: new URLSearchParams(location.search).get("room") || "",
    checkIn: "",
    checkOut: "",
    numberOfGuests: 1
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/rooms").then((r) => setRooms(r.data.rooms));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const { data } = await api.post("/bookings", form);
      setMessage(
        `Reservation confirmed. Total: ₹${data.booking.totalPrice.toLocaleString("en-IN")}`
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed.");
    }
  };

  return (
    <section className="auth panel wide">
      <p className="eyebrow">MAKE IT YOURS</p>
      <h1>Reserve your stay.</h1>

      <form onSubmit={submit}>
        <label>
          Room
          <select
            required
            value={form.roomId}
            onChange={(e) => setForm({ ...form, roomId: e.target.value })}
          >
            <option value="">Choose a room</option>
            {rooms.map((r) => (
              <option value={r._id} key={r._id}>
                Room {r.roomNumber} · {r.type} · ₹{r.pricePerNight}/night
              </option>
            ))}
          </select>
        </label>

        <div className="two">
          <label>
            Check-in
            <input
              type="date"
              required
              value={form.checkIn}
              onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
            />
          </label>

          <label>
            Check-out
            <input
              type="date"
              required
              value={form.checkOut}
              onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
            />
          </label>
        </div>

        <label>
          Guests
          <input
            type="number"
            min="1"
            max="20"
            required
            value={form.numberOfGuests}
            onChange={(e) =>
              setForm({ ...form, numberOfGuests: Number(e.target.value) })
            }
          />
        </label>

        <button className="button">Confirm reservation</button>
      </form>

      {message && (
        <p className={message.startsWith("Reservation") ? "success" : "error"}>
          {message}
        </p>
      )}
    </section>
  );
}

function Bookings() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const load = () =>
    api.get("/bookings")
      .then((r) => setItems(r.data.bookings))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load bookings.")
      );

  useEffect(() => {
    load();
  }, []);

  const cancel = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`);
      load();
    } catch (e) {
      setError(e.response?.data?.message || "Cancellation failed.");
    }
  };

  return (
    <section className="section">
      <p className="eyebrow">YOUR RESERVATIONS</p>
      <h1>Bookings.</h1>

      {error && <p className="error">{error}</p>}

      <div className="list">
        {items.map((b) => (
          <article className="booking" key={b._id}>
            <div>
              <h3>Room {b.room?.roomNumber || "—"} · {b.room?.type || ""}</h3>
              <p>
                {new Date(b.checkIn).toLocaleDateString()} →{" "}
                {new Date(b.checkOut).toLocaleDateString()} ·{" "}
                {b.numberOfGuests} guests
              </p>
              <small>{b.status}</small>
            </div>

            <div className="booking-end">
              <strong>₹{b.totalPrice.toLocaleString("en-IN")}</strong>
              {b.status === "confirmed" && (
                <button className="ghost" onClick={() => cancel(b._id)}>
                  Cancel
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      {!items.length && <p className="muted">No reservations yet.</p>}
    </section>
  );
}

function Manage() {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    roomNumber: "",
    type: "Deluxe",
    pricePerNight: 2500,
    capacity: 2,
    description: "",
    amenities: "Wi-Fi, AC"
  });

  const load = () => {
    api.get("/rooms")
      .then((r) => setRooms(r.data.rooms))
      .catch((e) =>
        setMsg(e.response?.data?.message || "Could not load rooms.")
      );
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      await api.post("/rooms", {
        ...form,
        amenities: form.amenities.split(",").map((x) => x.trim()).filter(Boolean)
      });

      setMsg("Room added.");
      setForm({ ...form, roomNumber: "" });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not add room.");
    }
  };

  const edit = async (room) => {
    const price = window.prompt(
      `New nightly price for room ${room.roomNumber}`,
      room.pricePerNight
    );

    if (price === null) return;

    const capacity = window.prompt("Guest capacity", room.capacity);
    if (capacity === null) return;

    if (!Number.isFinite(Number(price)) || Number(price) <= 0 ||
        !Number.isInteger(Number(capacity)) || Number(capacity) < 1) {
      setMsg("Enter a valid price and guest capacity.");
      return;
    }

    try {
      await api.patch(`/rooms/${room._id}`, {
        pricePerNight: Number(price),
        capacity: Number(capacity)
      });

      setMsg("Room updated successfully.");
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || "Could not update room.");
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm("Deactivate this room? It will no longer appear in the public room list.")) {
      return;
    }

    try {
      await api.delete(`/rooms/${id}`);
      setMsg("Room deactivated.");
      load();
    } catch (e) {
      setMsg(e.response?.data?.message || "Action failed.");
    }
  };

  return (
    <section className="section">
      <p className="eyebrow">STAFF WORKSPACE</p>
      <h1>Room management.</h1>

      {msg && <p className="manage-message">{msg}</p>}

      <div className="manage-grid">
        <form className="panel" onSubmit={create}>
          <h2>Add a room</h2>

          <input
            placeholder="Room number"
            required
            value={form.roomNumber}
            onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
          />

          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {["Standard", "Deluxe", "Suite", "Family"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Price per night"
            value={form.pricePerNight}
            onChange={(e) =>
              setForm({ ...form, pricePerNight: Number(e.target.value) })
            }
          />

          <input
            type="number"
            min="1"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) })
            }
          />

          <input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <input
            placeholder="Amenities, comma separated"
            value={form.amenities}
            onChange={(e) => setForm({ ...form, amenities: e.target.value })}
          />

          <button className="button">Add room</button>
        </form>

        <div className="list manage-room-list">
          {rooms.map((r) => (
            <article className="booking manage-room-row" key={r._id}>
              <div className="manage-room-details">
                <h3>Room {r.roomNumber}</h3>
                <p>
                  {r.type} · ₹{r.pricePerNight}/night · {r.capacity} guests
                </p>
              </div>

              <div className="room-actions">
                <button
                  type="button"
                  className="ghost edit-room-button"
                  onClick={() => edit(r)}
                >
                  Edit Room
                </button>

                {user?.role === "admin" && (
                  <button
                    type="button"
                    className="ghost deactivate-room-button"
                    onClick={() => deactivate(r._id)}
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </article>
          ))}

          {!rooms.length && (
            <p className="muted">No rooms found. Add your first room.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get("/dashboard")
      .then((r) => setMetrics(r.data.metrics))
      .catch(() => {});
  }, []);

  return (
    <section className="section">
      <p className="eyebrow">AT A GLANCE</p>
      <h1>Overview.</h1>

      {metrics ? (
        <div className="metrics">
          {[
            ["Active rooms", metrics.activeRooms],
            ["Current bookings", metrics.currentBookings],
            ["Reservations", metrics.reservations],
            ["Booking value", `₹${metrics.totalValue.toLocaleString("en-IN")}`]
          ].map(([k, v]) => (
            <div className="metric" key={k}>
              <small>{k}</small>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Sign in as staff or admin to view your dashboard.</p>
      )}
    </section>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <Shell>
      <Routes>
        <Route
          path="/"
          element={
            user && ["staff", "admin"].includes(user.role)
              ? <Dashboard />
              : <Home />
          }
        />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/book" element={<Protected><BookingForm /></Protected>} />
        <Route path="/bookings" element={<Protected><Bookings /></Protected>} />
        <Route
          path="/manage"
          element={
            <Protected roles={["staff", "admin"]}>
              <Manage />
            </Protected>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </Shell>
  );
}
