//imports 
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

//function import 
const response = require("./utils/response");

//models imports
const Template = require("./model/TempModel");
const inspection = require("./model/InspectionModel");

//routes imports 
const uploadRoutes = require("./routes/TemplateRoutes");
const UserRoutes = require("./routes/UserRoutes");
const InpectionRoutes = require("./routes/InpectionRoutes"); 
const ExecutiveRoutes = require("./routes/ExecutiveRoutes");


//declearation 
const app = express();
app.use(cors());
app.use(express.json());
const apiRouter = express.Router();
const PORT = process.env.PORT;

//multer 
const storage = multer.diskStorage({
  destination: path.join(__dirname, "./public/uploads/"),
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });



//routes 
apiRouter.use("/user", UserRoutes);
apiRouter.use("/template", uploadRoutes);
apiRouter.use("/inspection", InpectionRoutes);
apiRouter.use("/executive", ExecutiveRoutes);




// Serve static files from the uploads directory
app.use("/public/uploads", express.static(path.join(__dirname, "public/uploads")));

app.post("/api/template/upload", upload.fields([{ name: "pdf" }]), async (req, res) => {
  try {
    // Multer middleware will handle file upload and store it in req.file
    const uploadedFile = req.files.pdf;
    console.log(uploadedFile);
    console.log(req.body);
    // Check if file is uploaded
    if (!uploadedFile) {
      return res.status(400).send("No file uploaded");
    }

    // Create fileInfo object
    const fileInfo = {
      fileName: uploadedFile.filename,
      filePath: `http://localhost:7000/public/uploads/${req.files.pdf[0].filename}`
    };

    console.log(fileInfo);

    // Create a new Template instance with data from request body and fileInfo
    const templateInstance = new Template({
      TemplateName: req.body.TemplateName,
      description: req.body.description,
      pdf: fileInfo.filePath,
    });

    // Save the Template instance to the database
    const savedTemplate = await templateInstance.save();

    console.log("Template saved:", savedTemplate);
    // Respond with success message
    res.status(201).json(response(savedTemplate, "Template is created", null));
  } catch (error) {
    console.error("Error saving template:", error);
    // Respond with error message
    res
      .status(500)
      .json(response(null, "Error saving template", error.message));
  }
})

app.post("/api/inspection/upload" , upload.fields([{ name: "pdf" }
]), async (req, res) => {
  try {
    const {clientName , email , phone , address ,InpectionDate ,InspectionName} = req.body 
    // Multer middleware will handle file upload and store it in req.file
    const uploadedFile = req.files.pdf;

    // Check if file is uploaded
    if (!uploadedFile) {
      return res.status(400).send("No file uploaded");
    }

    // Create fileInfo object
    const fileInfo = {
      fileName: uploadedFile.filename,
      filePath: `http://localhost:7000/public/uploads/${req.files.pdf[0].filename}`
    };

    console.log(fileInfo);

    // Create a new Template instance with data from request body and fileInfo
    const InspectionInstace = new inspection({
      InspectionName : InspectionName || "",

      clientName : clientName  ,
      email : email || null ,
      phone : phone || null ,
      address : address || null ,
      InpectionDate : InpectionDate  ,
      pdf: fileInfo.filePath,
    });

    // Save the Template instance to the database
    const savedTemplate = await InspectionInstace.save();

    console.log("Template saved:", savedTemplate);
    // Respond with success message
    res.status(201).json(response(savedTemplate, "Template is created", null));
  }
  catch (error) {
    console.error("Error saving template:", error);
    // Respond with error message
    res
      .status(500)
      .json(response(null, "Error saving template", error.message));
  }
}
)


//connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((e) => {
    console.log(e);
  });

app.use("/api", apiRouter);


//start server 
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
