import crypto from "crypto";

export const generateActivationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateTokenExpiry = (hours = 24) => {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
};
