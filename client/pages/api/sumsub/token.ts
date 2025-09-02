import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

// Sumsub API Configuration
const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = process.env.SUMSUB_BASE_URL || "https://api.sumsub.com";

interface SumsubTokenResponse {
  accessToken?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SumsubTokenResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user ID from session or request
    const { userId, levelName = "basic-kyc-level" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      return res
        .status(500)
        .json({ error: "Sumsub credentials not configured" });
    }

    // Generate access token for user
    const accessToken = await generateSumsubAccessToken(userId, levelName);

    if (!accessToken) {
      return res.status(500).json({ error: "Failed to generate access token" });
    }

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Sumsub token generation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function generateSumsubAccessToken(
  userId: string,
  levelName: string
): Promise<string | null> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const method = "POST";
    const url = `/resources/accessTokens?userId=${userId}&levelName=${levelName}`;

    // Create signature
    const signature = crypto
      .createHmac("sha256", SUMSUB_SECRET_KEY!)
      .update(ts + method + url)
      .digest("hex");

    const response = await fetch(`${SUMSUB_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-App-Token": SUMSUB_APP_TOKEN!,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts.toString(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Sumsub API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("Failed to generate Sumsub access token:", error);
    return null;
  }
}

// Helper function to check KYC status
export async function checkKYCStatus(userId: string): Promise<any> {
  try {
    const ts = Math.floor(Date.now() / 1000);
    const method = "GET";
    const url = `/resources/applicants/${userId}/one`;

    const signature = crypto
      .createHmac("sha256", SUMSUB_SECRET_KEY!)
      .update(ts + method + url)
      .digest("hex");

    const response = await fetch(`${SUMSUB_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-App-Token": SUMSUB_APP_TOKEN!,
        "X-App-Access-Sig": signature,
        "X-App-Access-Ts": ts.toString(),
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to check KYC status:", error);
    return null;
  }
}
