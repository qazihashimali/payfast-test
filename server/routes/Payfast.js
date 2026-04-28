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
    // console.log("=== HASH DEBUG ===");
    // console.log("MERCHANT_ID :", MERCHANT_ID);
    // console.log("SECURED_KEY :", SECURED_KEY);
    // console.log("BASKET_ID   :", BASKET_ID);
    // console.log("TXNAMT      :", TXNAMT);
    // console.log("CURRENCY    :", CURRENCY);
    // console.log("TXNDATETIME :", TXNDATETIME);
    // console.log("TXNDESC     :", TXNDESC);
    // console.log("SUCCESS_URL :", SUCCESS_URL);
    // console.log("FAILURE_URL :", FAILURE_URL);
    // console.log("hashString  :", hashString);
    // console.log("SIGNATURE   :", SIGNATURE);
    // console.log("==================");
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
      CHECKOUT_URL: SUCCESS_URL,
      RETURN_URL: SUCCESS_URL,
      CURRENCY_CODE: CURRENCY,
      TXNDESC,
      STORE_ID: "",
    };

    res.json({
      success: true,

      payload,
    });
  } catch (err) {
    console.error("PayFast initiate error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate payment" });
  }
});

payfastRouter.post("/success", (req, res) => {
  const { BASKET_ID, TXNAMT, RESPONSE_CODE } = req.body; // ← req.body not req.query
  if (RESPONSE_CODE === "00") {
    return res.redirect(
      `${process.env.CLIENT_URL}/order-success?orderId=${BASKET_ID}&amount=${TXNAMT}`
    );
  }
  res.redirect(`${process.env.CLIENT_URL}/order-failed?code=${RESPONSE_CODE}`);
});

payfastRouter.post("/failure", (req, res) => {
  const { RESPONSE_CODE, BASKET_ID } = req.body; // ← req.body not req.query
  res.redirect(
    `${process.env.CLIENT_URL}/order-failed?code=${RESPONSE_CODE}&orderId=${BASKET_ID}`
  );
});

export default payfastRouter;

// import express from "express";
// import crypto from "crypto";
// import axios from "axios";

// const payfastRouter = express.Router();

// // ========== HELPER FUNCTIONS ==========

// function handleSuccess(data, res) {
//   console.log("=== PAYFAST SUCCESS CALLBACK ===");
//   console.log(JSON.stringify(data, null, 2));
//   console.log("================================");

//   const BASKET_ID =
//     data.basket_id || data.BASKET_ID || data.pp_TxnRefNo || "unknown";

//   const TXNAMT =
//     data.transaction_amount || data.TXNAMT || data.pp_Amount || "0";

//   const CODE =
//     data.RESPONSE_CODE || data.pp_ResponseCode || data.err_code || "unknown";

//   console.log("CODE:", CODE, "| BASKET_ID:", BASKET_ID, "| TXNAMT:", TXNAMT);

//   if (CODE === "00" || CODE === "000") {
//     return res.redirect(
//       `${process.env.CLIENT_URL}/order-success?orderId=${BASKET_ID}&amount=${TXNAMT}`
//     );
//   }

//   res.redirect(
//     `${process.env.CLIENT_URL}/order-failed?code=${CODE}&orderId=${BASKET_ID}`
//   );
// }

// function handleFailure(data, res) {
//   console.log("=== PAYFAST FAILURE CALLBACK ===");
//   console.log(JSON.stringify(data, null, 2));
//   console.log("================================");

//   const CODE =
//     data.RESPONSE_CODE || data.pp_ResponseCode || data.err_code || "unknown";

//   const BASKET_ID = data.basket_id || data.BASKET_ID || data.pp_TxnRefNo || "";

//   const MSG = data.err_msg || data.pp_ResponseMessage || "";

//   console.log("CODE:", CODE, "| MSG:", MSG, "| BASKET_ID:", BASKET_ID);

//   res.redirect(
//     `${
//       process.env.CLIENT_URL
//     }/order-failed?code=${CODE}&msg=${encodeURIComponent(
//       MSG
//     )}&orderId=${BASKET_ID}`
//   );
// }

// // ========== INITIATE PAYMENT ==========

// payfastRouter.post("/initiate", async (req, res) => {
//   try {
//     const { amount, orderId, customerEmail, customerPhone, description } =
//       req.body;

//     const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID?.trim();
//     const SECURED_KEY = process.env.PAYFAST_SECURED_KEY?.trim();
//     const BASE_URL = process.env.PAYFAST_BASE_URL?.trim();
//     const CLIENT_URL = process.env.CLIENT_URL?.trim();
//     const SERVER_URL = process.env.SERVER_URL?.trim();

//     const SUCCESS_URL = `${SERVER_URL}/api/payfast/success`;
//     const FAILURE_URL = `${SERVER_URL}/api/payfast/failure`;
//     const BASKET_ID = (orderId || `ORDER-${Date.now()}`).trim();
//     const TXNAMT = parseFloat(amount).toFixed(2); // "1000.00"
//     const CURRENCY = "PKR";
//     const TXNDATETIME = new Date()
//       .toISOString()
//       .replace("T", " ")
//       .substring(0, 19);
//     const TXNDESC = (description || "Online Order").trim();

//     // ✅ Exact hash order PayFast expects
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

//     console.log("=== HASH DEBUG ===");
//     console.log("MERCHANT_ID  :", MERCHANT_ID);
//     console.log("SECURED_KEY  :", SECURED_KEY);
//     console.log("BASKET_ID    :", BASKET_ID);
//     console.log("TXNAMT       :", TXNAMT);
//     console.log("CURRENCY     :", CURRENCY);
//     console.log("TXNDATETIME  :", TXNDATETIME);
//     console.log("TXNDESC      :", TXNDESC);
//     console.log("SUCCESS_URL  :", SUCCESS_URL);
//     console.log("FAILURE_URL  :", FAILURE_URL);
//     console.log("hashString   :", hashString);
//     console.log("SIGNATURE    :", SIGNATURE);
//     console.log("==================");

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
//       CHECKOUT_URL: CLIENT_URL,
//       RETURN_URL: SUCCESS_URL,
//       CURRENCY_CODE: CURRENCY,
//       TXNDESC,
//       STORE_ID: "",
//     };

//     console.log("=== SENDING TO PAYFAST ===");
//     console.log(JSON.stringify(payload, null, 2));
//     console.log("==========================");

//     const tokenRes = await axios.post(
//       `${BASE_URL}/Ecommerce/api/Transaction/GetAccessToken`,
//       new URLSearchParams(payload).toString(),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     console.log("=== TOKEN RESPONSE ===");
//     console.log(JSON.stringify(tokenRes.data, null, 2));
//     console.log("======================");

//     const accessToken = tokenRes.data.ACCESS_TOKEN;

//     if (!accessToken) {
//       console.error("❌ No ACCESS_TOKEN received:", tokenRes.data);
//       return res.status(500).json({
//         success: false,
//         message: "PayFast did not return an access token",
//         payfastResponse: tokenRes.data,
//       });
//     }

//     console.log("✅ ACCESS_TOKEN received:", accessToken);

//     res.json({
//       success: true,
//       accessToken,
//       payload,
//     });
//   } catch (err) {
//     console.error(
//       "❌ PayFast initiate error:",
//       err?.response?.data || err.message
//     );
//     res.status(500).json({
//       success: false,
//       message: "Failed to initiate payment",
//       error: err?.response?.data || err.message,
//     });
//   }
// });

// // ========== SUCCESS CALLBACK ==========
// // PayFast may use GET or POST — handle both
// payfastRouter.get("/success", (req, res) => handleSuccess(req.query, res));
// payfastRouter.post("/success", (req, res) => handleSuccess(req.body, res));

// // ========== FAILURE CALLBACK ==========
// // PayFast may use GET or POST — handle both
// payfastRouter.get("/failure", (req, res) => handleFailure(req.query, res));
// payfastRouter.post("/failure", (req, res) => handleFailure(req.body, res));

// export default payfastRouter;
