import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export default {
  env: process.env.NODE_ENV,
  stripe_key: process.env.STRIPE_SECRET_KEY,
  port: process.env.PORT,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  },
  reset_pass_link: process.env.RESET_PASS_LINK,
  email: process.env.EMAIL,
  brevo_email: process.env.EMAIL,
  brevo_pass: process.env.BREVO_PASS,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

  DO_SPACES_ENDPOINT: process.env.DO_SPACE_ENDPOINT,
  DO_ACCESS_KEY_ID: process.env.DO_SPACE_ACCESS_KEY,
  DO_SECRET_ACCESS_KEY: process.env.DO_SPACE_SECRET_KEY,
  DO_SPACES_BUCKET: process.env.DO_SPACE_BUCKET,
}
