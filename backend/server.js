require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(cors());

// ** Serve static files from the "public" directory **
app.use(express.static(path.join(__dirname, "public")));

// ** MongoDB Connection **
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ** Stripe Payment Intent API **
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.json({ clientSecret: paymentIntent.client_secret, orderId: paymentIntent.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ** Confirm Payment API **
app.post("/confirm-payment", async (req, res) => {
  try {
    const { orderId, paymentStatus } = req.body;
    console.log(`Order ${orderId} payment status: ${paymentStatus}`);
    res.json({ success: true, message: "Payment recorded successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ** Serve Frontend (Checkout Page) **
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "checkout.html"));
});

// ** Start Server **
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
