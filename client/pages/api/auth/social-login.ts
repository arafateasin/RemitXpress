import type { NextApiRequest, NextApiResponse } from "next";

interface SocialLoginRequest {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  image?: string;
  profile: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      provider,
      providerId,
      email,
      name,
      image,
      profile,
    }: SocialLoginRequest = req.body;

    // Here you would normally:
    // 1. Check if user exists in your database by email or providerId
    // 2. If not, create a new user
    // 3. Generate a JWT token
    // 4. Return user data and token

    // For now, we'll simulate a successful response
    const userData = {
      id: `${provider}_${providerId}`,
      email,
      firstName: name?.split(" ")[0] || "User",
      lastName: name?.split(" ").slice(1).join(" ") || "",
      provider,
      providerId,
      image,
      kycStatus: "pending",
      isVerified: true,
      role: "user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Generate a mock JWT token (in production, use a proper JWT library)
    const token = Buffer.from(
      JSON.stringify({
        userId: userData.id,
        email: userData.email,
        provider,
        iat: Date.now(),
      })
    ).toString("base64");

    return res.status(200).json({
      success: true,
      message: "Social login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("Social login error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during social login",
    });
  }
}
