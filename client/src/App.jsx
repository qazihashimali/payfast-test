import { useState } from "react";
import axios from "axios";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(
        "https://payfast-test.vercel.app/api/payfast/initiate",
        {
          amount: "1000",
          orderId: "ORDER-" + Date.now(),
          customerEmail: "test@example.com",
          customerPhone: "03001234567",
          description: "Test Order",
        }
      );

      if (!data.success) throw new Error(data.message || "Initiation failed");

      console.log("PayFast payload:", data.payload);
      console.log("Access token:", data.accessToken);

      // Build a hidden POST form and submit to PayFast
      const form = document.createElement("form");
      form.method = "POST";
      form.action =
        "https://ipguat.apps.net.pk/Ecommerce/api/Transaction/PostTransaction";

      const fields = {
        ...data.payload,
        ACCESS_TOKEN: data.accessToken,
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value ?? "";
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Payment error:", err);
      setError(
        err?.response?.data?.error || err.message || "Something went wrong"
      );
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>PayFast Test Payment</h2>
      <p>
        Amount: <strong>PKR 1,000</strong>
      </p>

      {error && (
        <p
          style={{
            color: "red",
            background: "#fff0f0",
            padding: 10,
            borderRadius: 6,
          }}
        >
          ❌ {error}
        </p>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: "10px 24px",
          fontSize: 16,
          background: loading ? "#aaa" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Redirecting to PayFast..." : "Pay Now"}
      </button>
    </div>
  );
}
