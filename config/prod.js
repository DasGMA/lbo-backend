module.exports = {
  PORT: process.env.PORT,
  DB_URI: process.env.DB_URI,
  SECRET: process.env.SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  TOKEN_SECRET: process.env.TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  AWS_SECRET_ACCESS: process.env.AWS_SECRET_ACCESS,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  EMAIL_FROM: 'info@node-mongo-signup-verification-api.com',
  SMTP_OPTIONS: {
    host: '[ENTER YOUR OWN SMTP OPTIONS OR CREATE FREE TEST ACCOUNT IN ONE CLICK AT https://ethereal.email/]',
    port: 587,
      auth: {
        user: '',
        pass: ''
      }
    }
}