export async function getShiprocketToken() {
  try {
    const res = await fetch(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD,
        }),
      }
    );

    const data = await res.json();

    if (!data.token) throw new Error("Failed to authenticate with Shiprocket");
    return data.token as string;
  } catch (error) {
    console.error("Failed to authenticate with Shiprocket", error);
  }
}
