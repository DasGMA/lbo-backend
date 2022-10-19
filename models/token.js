const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TokenSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    token: String,
    expires: Date,
    createdByIp: String,
    revoked: Date,
    revokedByIp: String,
    replacedByToken: String,
  },
  {
    timestamps: true,
  },
);

TokenSchema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

TokenSchema.virtual("isActive").get(function () {
  return !this.isExpired && !this.revoked;
});

const Token = mongoose.model("Token", TokenSchema);

module.exports = Token;
