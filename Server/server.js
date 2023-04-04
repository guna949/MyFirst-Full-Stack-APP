const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const app = express();
const Users = require("./models/userModel");
app.use(express.json());
app.use(express.static("public"));

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const JWT_SECRET = "mysecretkey";

// const authenticateJWT = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (authHeader) {
//     const token = authHeader.split(" ")[1];

//     jwt.verify(token, JWT_SECRET, (err, user) => {
//       if (err) {
//         return res.sendStatus(403);
//       }

//       req.user = user;
//       next();
//     });
//   } else {
//     res.sendStatus(401);
//   }
// };

mongoose
  .connect(
    "mongodb+srv://Gunasekarmuthusamy:Gunaguna146@cluster0.aypanqy.mongodb.net/auth"
  )
  .then(() => {
    console.log("DB Connected");
  })
  .catch((error) => {
    console.log("Error connecting to database:", error);
  });

const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("profileImage");

function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}

app.post("/newuser", (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err) {
        return res.status(400).json({ message: err });
      }

      const user = await Users.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        password: req.body.password,
        gender: req.body.gender,
        education: req.body.education,
        city: req.body.city,
        group: req.body.group,
        country: req.body.country,
      });

      if (req.file) {
        user.profileImage = req.file.filename;
        await user.save();
      }

      //Generate Web Token//
      const token = jwt.sign({ id: user._id }, JWT_SECRET);
      res.status(200).json({ user, token });
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

app.get("/newuser/read/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const readuser = await Users.findById(id);
    res.status(200).json(readuser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/newuser/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndUpdate(id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    const updateuser = await Users.findById(id);
    res.status(200).json(updateuser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/newuser/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndDelete(id, req.body);
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put(
  "/newuser/updateProfileImage/:id",

  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }

      upload(req, res, async function (err) {
        if (err) {
          return res.status(400).json({ message: err });
        }

        if (req.file) {
          user.profileImage = req.file.filename;
          await user.save();
        }

        res.status(200).json({ user });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

app.get("/newuser/readImage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const imagePath = path.join(
      __dirname,
      "public/uploads/",
      user.profileImage
    );

    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put(
  "/newuser/deleteProfileImage/:id",

  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findById(id);

      if (!user) {
        return res.status(404).json({ message: "User Not Found" });
      }

      user.profileImage = null;
      await user.save();

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  console.log(password);
  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User Not Found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET);

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "port working" });
});
app.listen(8008, () => {
  console.log("server running");
});
