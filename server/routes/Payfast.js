// import express from "express";
// import crypto from "crypto";
// import axios from "axios";

// const payfastRouter = express.Router();

// payfastRouter.post("/initiate", async (req, res) => {
//   try {
//     const { amount, orderId, customerEmail, customerPhone, description } =
//       req.body;

//     const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
//     const SECURED_KEY = process.env.PAYFAST_SECURED_KEY;
//     const BASE_URL = process.env.PAYFAST_BASE_URL;
//     const SUCCESS_URL = `${process.env.SERVER_URL}/api/payfast/success`;
//     const FAILURE_URL = `${process.env.SERVER_URL}/api/payfast/failure`;
//     const BASKET_ID = orderId || `ORDER-${Date.now()}`;
//     const TXNAMT = String(amount);
//     const CURRENCY = "PKR";
//     const TXNDATETIME = new Date()
//       .toISOString()
//       .replace("T", " ")
//       .substring(0, 19);
//     const TXNDESC = description || "Online Order";

//     const hashString =
//       MERCHANT_ID +
//       SECURED_KEY +
//       BASKET_ID +
//       TXNAMT +
//       CURRENCY +
//       TXNDATETIME +
//       TXNDESC +
//       SUCCESS_URL +
//       FAILURE_URL;

//     const SIGNATURE = crypto
//       .createHash("sha256")
//       .update(hashString)
//       .digest("hex")
//       .toUpperCase();
//     // console.log("=== HASH DEBUG ===");
//     // console.log("MERCHANT_ID :", MERCHANT_ID);
//     // console.log("SECURED_KEY :", SECURED_KEY);
//     // console.log("BASKET_ID   :", BASKET_ID);
//     // console.log("TXNAMT      :", TXNAMT);
//     // console.log("CURRENCY    :", CURRENCY);
//     // console.log("TXNDATETIME :", TXNDATETIME);
//     // console.log("TXNDESC     :", TXNDESC);
//     // console.log("SUCCESS_URL :", SUCCESS_URL);
//     // console.log("FAILURE_URL :", FAILURE_URL);
//     // console.log("hashString  :", hashString);
//     // console.log("SIGNATURE   :", SIGNATURE);
//     // console.log("==================");
//     const payload = {
//       MERCHANT_ID,
//       MERCHANT_NAME: "Your Store Name",
//       SECURED_KEY,
//       TOKEN: "",
//       PROCCODE: "00",
//       TXNAMT,
//       CUSTOMER_MOBILE_NO: customerPhone,
//       CUSTOMER_EMAIL_ADDRESS: customerEmail,
//       SIGNATURE,
//       VERSION: "ECOMV2",
//       TXNDATETIME,
//       SUCCESS_URL,
//       FAILURE_URL,
//       BASKET_ID,
//       ORDER_DATE: TXNDATETIME.substring(0, 10),
//       CHECKOUT_URL: SUCCESS_URL,
//       RETURN_URL: SUCCESS_URL,
//       CURRENCY_CODE: CURRENCY,
//       TXNDESC,
//       STORE_ID: "",
//     };

//     const tokenRes = await axios.post(
//       `${BASE_URL}/Ecommerce/api/Transaction/GetAccessToken`,
//       new URLSearchParams(payload).toString(),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     const accessToken = tokenRes.data.ACCESS_TOKEN;

//     res.json({
//       success: true,
//       accessToken,
//       payload,
//     });
//   } catch (err) {
//     console.error("PayFast initiate error:", err);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to initiate payment" });
//   }
// });

// payfastRouter.get("/success", (req, res) => {
//   const { BASKET_ID, TXNAMT, RESPONSE_CODE } = req.query;
//   if (RESPONSE_CODE === "00") {
//     return res.redirect(
//       `${process.env.CLIENT_URL}/order-success?orderId=${BASKET_ID}&amount=${TXNAMT}`
//     );
//   }
//   res.redirect(`${process.env.CLIENT_URL}/order-failed?code=${RESPONSE_CODE}`);
// });

// payfastRouter.get("/failure", (req, res) => {
//   const { RESPONSE_CODE } = req.query;
//   res.redirect(`${process.env.CLIENT_URL}/order-failed?code=${RESPONSE_CODE}`);
// });

// export default payfastRouter;

import express from "express";
import crypto from "crypto";
import axios from "axios";

const payfastRouter = express.Router();

payfastRouter.post("/initiate", async (req, res) => {
  try {
    const { amount, orderId, customerEmail, customerPhone, description } =
      req.body;

    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID;
    const SECURED_KEY = process.env.PAYFAST_SECURED_KEY;
    const BASE_URL = process.env.PAYFAST_BASE_URL;
    const SUCCESS_URL = `${process.env.SERVER_URL}/api/payfast/success`;
    const FAILURE_URL = `${process.env.SERVER_URL}/api/payfast/failure`;
    const BASKET_ID = orderId || `ORDER-${Date.now()}`;
    const TXNAMT = String(amount);
    const CURRENCY = "PKR";
    const TXNDATETIME = new Date()
      .toISOString()
      .replace("T", " ")
      .substring(0, 19);
    const TXNDESC = description || "Online Order";

    // Debug log — remove in production
    console.log("=== ENV CHECK ===");
    console.log("MERCHANT_ID :", MERCHANT_ID);
    console.log("SERVER_URL  :", process.env.SERVER_URL);
    console.log("CLIENT_URL  :", process.env.CLIENT_URL);
    console.log("SUCCESS_URL :", SUCCESS_URL);
    console.log("FAILURE_URL :", FAILURE_URL);
    console.log("=================");

    const hashString =
      MERCHANT_ID +
      SECURED_KEY +
      BASKET_ID +
      TXNAMT +
      CURRENCY +
      TXNDATETIME +
      TXNDESC +
      SUCCESS_URL +
      FAILURE_URL;

    const SIGNATURE = crypto
      .createHash("sha256")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    console.log("=== HASH DEBUG ===");
    console.log("hashString :", hashString);
    console.log("SIGNATURE  :", SIGNATURE);
    console.log("==================");

    const payload = {
      MERCHANT_ID,
      MERCHANT_NAME: "Your Store Name",
      SECURED_KEY,
      TOKEN: "",
      PROCCODE: "00",
      TXNAMT,
      CUSTOMER_MOBILE_NO: customerPhone,
      CUSTOMER_EMAIL_ADDRESS: customerEmail,
      SIGNATURE,
      VERSION: "ECOMV2",
      TXNDATETIME,
      SUCCESS_URL,
      FAILURE_URL,
      BASKET_ID,
      ORDER_DATE: TXNDATETIME.substring(0, 10),
      CHECKOUT_URL: process.env.CLIENT_URL, // ← fixed: your React app URL
      RETURN_URL: SUCCESS_URL,
      CURRENCY_CODE: CURRENCY,
      TXNDESC,
      STORE_ID: "",
    };

    const tokenRes = await axios.post(
      `${BASE_URL}/Ecommerce/api/Transaction/GetAccessToken`,
      new URLSearchParams(payload).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("=== TOKEN RESPONSE ===");
    console.log(JSON.stringify(tokenRes.data, null, 2));
    console.log("======================");

    const accessToken = tokenRes.data.ACCESS_TOKEN;

    if (!accessToken) {
      console.error("No ACCESS_TOKEN in response:", tokenRes.data);
      return res.status(500).json({
        success: false,
        message: "PayFast did not return an access token",
        payfastResponse: tokenRes.data,
      });
    }

    res.json({
      success: true,
      accessToken,
      payload,
    });
  } catch (err) {
    console.error(
      "PayFast initiate error:",
      err?.response?.data || err.message
    );
    res.status(500).json({
      success: false,
      message: "Failed to initiate payment",
      error: err?.response?.data || err.message,
    });
  }
});

// ✅ POST — PayFast POSTs to this URL after payment
payfastRouter.post("/success", (req, res) => {
  console.log("=== PAYFAST SUCCESS CALLBACK ===");
  console.log("BODY :", JSON.stringify(req.body, null, 2));
  console.log("QUERY:", JSON.stringify(req.query, null, 2));
  console.log("================================");

  const BASKET_ID =
    req.body.BASKET_ID || req.body.pp_TxnRefNo || req.query.BASKET_ID;

  const TXNAMT = req.body.TXNAMT || req.body.pp_Amount || req.query.TXNAMT;

  const CODE =
    req.body.RESPONSE_CODE ||
    req.body.pp_ResponseCode ||
    req.body.PP_ResponseCode ||
    req.query.RESPONSE_CODE ||
    "unknown";

  console.log(
    "Parsed → CODE:",
    CODE,
    "| BASKET_ID:",
    BASKET_ID,
    "| TXNAMT:",
    TXNAMT
  );

  if (CODE === "00") {
    return res.redirect(
      `${process.env.CLIENT_URL}/order-success?orderId=${BASKET_ID}&amount=${TXNAMT}`
    );
  }

  res.redirect(`${process.env.CLIENT_URL}/order-failed?code=${CODE}`);
});

// ✅ POST — PayFast POSTs to this URL on failure
payfastRouter.post("/failure", (req, res) => {
  console.log("=== PAYFAST FAILURE CALLBACK ===");
  console.log("BODY :", JSON.stringify(req.body, null, 2));
  console.log("QUERY:", JSON.stringify(req.query, null, 2));
  console.log("================================");

  const CODE =
    req.body.RESPONSE_CODE ||
    req.body.pp_ResponseCode ||
    req.body.PP_ResponseCode ||
    req.query.RESPONSE_CODE ||
    "unknown";

  res.redirect(`${process.env.CLIENT_URL}/order-failed?code=${CODE}`);
});

export default payfastRouter;
