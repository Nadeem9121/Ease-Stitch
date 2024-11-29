const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitze = require("express-mongo-sanitize");
const xss = require("xss-clean");

const userRouter = require("./routers/userRouters");
const userVerificationRoutes = require("./routers/userVerificationRoutes");
const passwordResetRoutes = require("./routers/forgotPasswordRotuers");
const session = require("express-session");

const app = express();

//middleware
//security HTTP headers
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitze());
//DATA SANITIZATION AGAINST XSS
app.use(xss());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/user-verification", userVerificationRoutes);
app.use("/api/v1/password-reset", passwordResetRoutes);

app.use((req, res, next) => {
  console.log("Hello from the middleware 👋");
  next();
});

module.exports = app;
