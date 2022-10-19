module.exports = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
  SECRET: process.env.SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  AWS_SECRET_ACCESS: process.env.AWS_SECRET_ACCESS,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  SMTP_OPTIONS: {
    host: process.env.EMAIL_HOST,
    port: 465,
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASSWORD,
    },
  },
};
