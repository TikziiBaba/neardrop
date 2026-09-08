import crypto from "crypto";

/**
 * PayTR Virtual POS Configuration & Service
 */
export function getPaytrConfig() {
  const merchantId = process.env.PAYTR_MERCHANT_ID || "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
  const testMode = process.env.PAYTR_TEST_MODE === "0" ? "0" : "1";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://neardrop.bekirr.dev";

  return {
    merchantId,
    merchantKey,
    merchantSalt,
    testMode,
    appUrl,
    isConfigured: Boolean(merchantId && merchantKey && merchantSalt),
  };
}

export interface CreatePaytrTokenParams {
  userId: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  userAddress?: string;
  userIp: string;
  planId: string;
  planName: string;
  billingCycle: "monthly" | "yearly";
  amount: number; // e.g. 99 or 990 in TL
}

export interface CreatePaytrTokenResponse {
  success: boolean;
  token?: string;
  merchantOid?: string;
  iframeUrl?: string;
  error?: string;
}

/**
 * Generate PayTR iFrame Token via PayTR API
 */
export async function createPaytrIframeToken(
  params: CreatePaytrTokenParams
): Promise<CreatePaytrTokenResponse> {
  const config = getPaytrConfig();
  if (!config.isConfigured) {
    return {
      success: false,
      error: "PayTR mağaza bilgileri yapılandırılmamış (.env.local kontrol edin)",
    };
  }

  try {
    // Unique order ID (Strictly alphanumeric: no underscores, no hyphens)
    const merchantOid = `ND${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    
    // Amount in cents (e.g. 99 TL -> 9900)
    const paymentAmount = Math.round(params.amount * 100).toString();

    // Basket preparation: [[Item Name, Unit Price, Quantity]]
    const basket = [
      [
        `${params.planName} (${params.billingCycle === "yearly" ? "Yıllık" : "Aylık"})`,
        params.amount.toFixed(2),
        1,
      ],
    ];
    const userBasket = Buffer.from(JSON.stringify(basket)).toString("base64");

    const noInstallment = "1"; // Tek çekim
    const maxInstallment = "0"; // Taksit yok
    const currency = "TL";
    const testMode = config.testMode;
    const timeoutLimit = "30"; // 30 minutes
    const debugOn = "1"; // Debug logs enabled

    // Clean IP: strip IPv6 prefix or fallback
    let userIp = params.userIp || "127.0.0.1";
    if (userIp.includes("::ffff:")) {
      userIp = userIp.replace("::ffff:", "");
    }
    if (userIp === "::1" || userIp === "localhost" || userIp.startsWith("127.")) {
      userIp = "176.234.0.1"; // Default fallback for local testing so PayTR doesn't reject loopback
    }

    const userName = params.userName?.trim() || "NearDrop Musterisi";
    const userAddress = params.userAddress?.trim() || "Turkiye";

    // Clean Phone: only digits, ensure 10-11 chars starting with 0
    let userPhone = (params.userPhone || "05555555555").replace(/\D/g, "");
    if (!userPhone.startsWith("0")) {
      userPhone = "0" + userPhone;
    }
    if (userPhone.length < 10) {
      userPhone = "05555555555";
    }

    const merchantOkUrl = `${config.appUrl}/checkout?status=success&plan=${params.planId}&oid=${merchantOid}`;
    const merchantFailUrl = `${config.appUrl}/checkout?status=failed&plan=${params.planId}&oid=${merchantOid}`;

    // Hash calculation:
    // merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket + no_installment + max_installment + currency + test_mode
    const hashStr =
      config.merchantId +
      userIp +
      merchantOid +
      params.userEmail +
      paymentAmount +
      userBasket +
      noInstallment +
      maxInstallment +
      currency +
      testMode;

    const paytrToken = crypto
      .createHmac("sha256", config.merchantKey)
      .update(hashStr + config.merchantSalt)
      .digest("base64");

    // PayTR API expects application/x-www-form-urlencoded
    const formData = new URLSearchParams();
    formData.append("merchant_id", config.merchantId);
    formData.append("user_ip", userIp);
    formData.append("merchant_oid", merchantOid);
    formData.append("email", params.userEmail);
    formData.append("payment_amount", paymentAmount);
    formData.append("paytr_token", paytrToken);
    formData.append("user_basket", userBasket);
    formData.append("debug_on", debugOn);
    formData.append("no_installment", noInstallment);
    formData.append("max_installment", maxInstallment);
    formData.append("user_name", userName);
    formData.append("user_address", userAddress);
    formData.append("user_phone", userPhone);
    formData.append("merchant_ok_url", merchantOkUrl);
    formData.append("merchant_fail_url", merchantFailUrl);
    formData.append("timeout_limit", timeoutLimit);
    formData.append("currency", currency);
    formData.append("test_mode", testMode);

    const res = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await res.json();

    if (data.status === "success" && data.token) {
      return {
        success: true,
        token: data.token,
        merchantOid,
        iframeUrl: `https://www.paytr.com/odeme/guvenli/${data.token}`,
      };
    } else {
      console.error("PayTR Token Hatası:", data.reason || data);
      return {
        success: false,
        error: data.reason || "PayTR ödeme tokenı alınamadı",
      };
    }
  } catch (error: any) {
    console.error("PayTR API İstek Hatası:", error);
    return {
      success: false,
      error: error.message || "PayTR bağlantı hatası",
    };
  }
}

/**
 * Verify PayTR Webhook / Callback Signature
 */
export function verifyPaytrCallback(payload: {
  merchant_oid: string;
  status: string;
  total_amount: string;
  hash: string;
}): boolean {
  const config = getPaytrConfig();
  if (!config.isConfigured) return false;

  try {
    // Hash order: merchant_oid + merchant_salt + status + total_amount
    const hashStr =
      payload.merchant_oid +
      config.merchantSalt +
      payload.status +
      payload.total_amount;

    const calculatedHash = crypto
      .createHmac("sha256", config.merchantKey)
      .update(hashStr)
      .digest("base64");

    return calculatedHash === payload.hash;
  } catch (err) {
    console.error("PayTR hash verify error:", err);
    return false;
  }
}
