const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const db = require("./Models");
const http = require("http");
const { Server } = require("socket.io");
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require("./cronJob")();

// Use Helmet with specific configurations
app.use(helmet());

// Set Strict-Transport-Security header
app.use(helmet.hsts({
  maxAge: 63072000, // 2 years in seconds
  includeSubDomains: true,
  preload: true
}));

// Set Content-Security-Policy header
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
  }
}));

// Set X-Content-Type-Options header
app.use(helmet.noSniff());

// Set X-XSS-Protection header
app.use(helmet.xssFilter({
  setOnOldIE: true
}));
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Set X-Frame-Options header
app.use(helmet.frameguard({
  action: 'sameorigin'
}));

// app.use(cors());
// app.use(cookieParser());

var allowedOrigins = [ 'http://localhost:3000', 'http://localhost:4200','https://ulip.mllqa.com','https://ulip.mahindralogistics.com']
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};
app.use(cors(corsOptions));
app.use(express.json());
const createRecordLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: "Too many records created from this IP, please try again after a minute"
});
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ['websocket']
  }
});

const port = 5000;

io.on('connection', (socket) => {
  console.log("backend connected");
  socket.emit("testevent", "This is text data");
});

const driverRouter = require("./routes/Driver");
const vehicleRouter = require("./routes/Vehicle");
const userRouter = require("./routes/User");
const apingRouter = require("./routes/ApingVahaan");

app.use("/driver", createRecordLimiter,driverRouter);
app.use("/user",createRecordLimiter, userRouter);
app.use("/vehicle",createRecordLimiter, vehicleRouter);
app.use("/aping",createRecordLimiter, apingRouter);

// app.use('/driver', (req, res, next) => {
//   res.cookie('driverToken', 'tokenValue', { path: '/driver', httpOnly: true, secure: true });
//   next();
// }, createRecordLimiter, driverRouter);

// app.use('/user', (req, res, next) => {
//   res.cookie('userToken', 'tokenValue', { path: '/user', httpOnly: true, secure: true });
//   next();
// }, createRecordLimiter, userRouter);

// app.use('/vehicle', (req, res, next) => {
//   res.cookie('vehicleToken', 'tokenValue', { path: '/vehicle', httpOnly: true, secure: true });
//   next();
// }, createRecordLimiter, vehicleRouter);

// app.use('/aping', (req, res, next) => {
//   res.cookie('apingToken', 'tokenValue', { path: '/aping', httpOnly: true, secure: true });
//   next();
// }, createRecordLimiter, apingRouter);


app.get('/', (req, res) => res.send('This is ulip-backend'));

db.sequelize.sync().then(() => {
  server.listen(port, () => {
    console.log(`App is working at port ${port}`);
    console.log(`Node.js version: ${process.version}`);
  });
});
