const config = {
  host: process.env.HOST || "localhost",
  port: parseInt(process.env.PORT || "5001"),
  environment: process.env.NODE_ENV || "development",
  cors: {
    whitelist: ["*"],
    origin: process.env.CORS_ORIGIN || "*",
  },
  argon: {
    argonSecretKey: process.env.ARGON_SECRET || "my_secret_key",
  },
  database: {
    uri: process.env.MONGO_DB_URI || "host",
  },
  token: {
    jwtTokenSecret: process.env.JWT_TOKEN_SECRET || "jwt_token_secret",
  },
};

export default config;
