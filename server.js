// ---------------------- IMPORTS ----------------------
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();
const registerRoutes = require("./routes/registerRoutes");

// ---------------------- APP INIT ----------------------
const app = express();

app.use(express.json());



// ---------------------- APP INIT ----------------------


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", registerRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname)));

// ---------------------- DATABASE ----------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/userDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ---------------------- SCHEMAS ----------------------

// Users
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});
const User = mongoose.model("User", userSchema);

// Pitch submissions
const pitchSchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  founder_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  industry: { type: String, required: true },
  stage: { type: String, required: true },
  funding_amount: String,
  team_size: String,
  pitch_summary: { type: String, required: true },
  problem_statement: { type: String, required: true },
  solution: { type: String, required: true },
  target_market: { type: String, required: true },
  business_model: { type: String, required: true },
  competition: String,
  submitted_at: { type: Date, default: Date.now },
});
const Pitch = mongoose.model("Pitch", pitchSchema);

// Investor submissions
const investmentSchema = new mongoose.Schema({
  startupName: String,
  name: String,
  email: String,
  amount: Number,
  message: String,
  submitted_at: { type: Date, default: Date.now },
});
const Investment = mongoose.model("Investment", investmentSchema);

// Community submissions
const communitySchema = new mongoose.Schema({
  name: String,
  email: String,
  organization: String,
  reason: String,
  joined_at: { type: Date, default: Date.now },
});
const Community = mongoose.model("Community", communitySchema);

// ---------------------- MENTOR CONTACT SCHEMA ----------------------
const mentorContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  profession: { type: String, required: true },
  goal: { type: String, required: true },
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const MentorContact = mongoose.model("MentorContact", mentorContactSchema);


// ---------------------- CONTACT FORM SCHEMA ----------------------
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  submitted_at: { type: Date, default: Date.now },
});
const Contact = mongoose.model("Contact", contactSchema);

// ---------------------- CONTACT ROUTES ----------------------
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    console.log("📩 New contact saved:", newContact);
    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Contact submission error:", err);
    res.status(500).json({ success: false, message: "Error submitting contact form" });
  }
});






// ---------------------- ROUTES ----------------------

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.json({ success: true, message: "Signup successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ SEND PROFILE DATA
    res.json({
      success: true,
      username: user.username,
      email: user.email,
      id: user._id
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= PROFILE =================
app.get("/profile/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
});




// ---------------------- PITCH ROUTES ----------------------
app.post("/api/submit-pitch", async (req, res) => {
  try {
    const newPitch = new Pitch(req.body);
    await newPitch.save();
    res.json({ success: true, message: "Pitch submitted successfully!" });
  } catch (err) {
    console.error("❌ Pitch submission error:", err);
    res.status(500).json({ success: false, message: "Error submitting pitch" });
  }
});

app.get("/api/pitches", async (req, res) => {
  try {
    const pitches = await Pitch.find().sort({ submitted_at: -1 });
    res.json(pitches);
  } catch (err) {
    console.error("❌ Fetch pitches error:", err);
    res.status(500).json({ success: false, message: "Error fetching pitches" });
  }
});

// ---------------------- INVESTOR ROUTES ----------------------
app.post("/api/invest", async (req, res) => {
  try {
    const newInvestment = new Investment(req.body);
    await newInvestment.save();
    res.json({ success: true, message: "Investment submitted successfully!" });
  } catch (err) {
    console.error("❌ Investment submission error:", err);
    res.status(500).json({ success: false, message: "Error submitting investment" });
  }
});

// ---------------------- COMMUNITY ROUTES ----------------------
app.post("/api/community", async (req, res) => {
  try {
    const newMember = new Community(req.body);
    await newMember.save();
    res.json({ success: true, message: "Joined community successfully!" });
  } catch (err) {
    console.error("❌ Community join error:", err);
    res.status(500).json({ success: false, message: "Error joining community" });
  }
});

// ---------------------- MENTOR CONTACT ROUTES ----------------------
app.post("/api/mentor-contact", async (req, res) => {
  try {
    console.log("📥 New Mentor Contact Received:", req.body);
    const newContact = new MentorContact(req.body);
    await newContact.save();
    console.log("✅ Mentor Contact Saved");
    res.json({ success: true, message: "Mentor contact saved successfully!" });
  } catch (err) {
    console.error("❌ Mentor contact submission error:", err);
    res.status(500).json({ success: false, message: "Error saving mentor contact" });
  }
});

app.get("/api/mentor-contacts", async (req, res) => {
  try {
    const contacts = await MentorContact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error("❌ Fetch mentor contacts error:", err);
    res.status(500).json({ success: false, message: "Error fetching mentor contacts" });
  }
});

// ✅ ADDITION FOR MENTORVERSE FORM (matches frontend /api/lead)
app.post("/api/lead", async (req, res) => {
  try {
    console.log("📩 MentorVerse Lead received:", req.body);
    const newLead = new MentorContact(req.body);
    await newLead.save();
    console.log("✅ MentorVerse Lead Saved!");
    res.json({ success: true, message: "MentorVerse lead saved successfully!" });
  } catch (err) {
    console.error("❌ MentorVerse lead error:", err);
    res.status(500).json({ success: false, message: "Error saving MentorVerse lead" });
  }
});


// ---------------------- CHATBOT (optional) ----------------------
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  try {
    let reply = "";

    if (process.env.PROVIDER === "groq") {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20B",
          messages: [{ role: "user", content: message }],
        }),
      });

      const data = await response.json();
      reply = data?.choices?.[0]?.message?.content || "⚠️ No response from Groq";
    } else if (process.env.PROVIDER === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
        }
      );

      const data = await response.json();
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ No response from Gemini";
    }

    res.json({ reply });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------- START SERVER ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔄 Active Provider: ${process.env.PROVIDER || "none"}`);
});

// ----------------------email----------------------

const nodemailer = require("nodemailer");
app.post("/reserve", async (req, res) => {
  const { name, email, startup, role } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Startup Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ Your Spot is Reserved!",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your spot for <b>Founder Networking Night</b> has been successfully reserved.</p>
        <p><b>Startup:</b> ${startup || "N/A"}</p>
        <p><b>Role:</b> ${role}</p>
        <p><b>Date:</b> 20 November 2025</p>
        <p><b>Time:</b> 7:00 PM IST</p>
        <br/>
        <p>🚀 See you at the event!</p>
      `
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});



app.get("/api/pitches", async (req, res) => {
  const pitches = await Pitch.find().sort({ submitted_at: -1 });
  res.json(pitches);
});


app.get("/api/leads", async (req, res) => {
  try {
    const leads = await MentorContact.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ message: "Error fetching leads" });
  }
});
