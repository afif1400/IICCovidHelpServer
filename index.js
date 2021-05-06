require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios").default;
const mongoose = require("mongoose");
const app = express();

const dev_config = {
  origin: "http://localhost:3000",
};
const prod_config = {
  //   origin: "https://brave-hopper-919f2d.netlify.app",
  origin: "",
};
const LogOptions = {
  basePath: 'Logs',
  fileName: 'Server.log',
  ip: true,
  showOnConsole: true
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require('express-file-logger')(app, LogOptions);
app.use(cors(process.env.NODE_ENV === "production" ? prod_config : dev_config));
const port = process.env.PORT || 5000;
mongoose
  .connect(process.env.DBURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((connection) => {
    app.get("/", (req, res) => {
      let doc = {
        mobile: req.body.mobile,
      };
      axios
        .post("https://cdn-api.co-vin.in/api/v2/auth/public/generateOTP", doc)
        .then((response) => {
          console.log(response.data);
          res.status(200).json({ m: "Response Sent" });
        })
        .catch((err) => {
          console.log("Couldnot generate OTP for the given number. This error occured=>\n",err);
        });
    });
    app.use("/otp", require("./Routes/OTPconfirm"));
    app.use("/state", require("./Routes/getStates"));
    app.use("/district", require("./Routes/getDistricts"));
    app.use("/slots", require("./Routes/getVaccineSlots"));
    app.use("/signup",require("./Routes/Signup"));
  }).catch((error)=>{
    console.log("Could not connect to Database, this error occured=>\n",error);
  });

app.listen(port, () => console.log(`Server Running on port ${port}`));
