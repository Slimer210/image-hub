const { IncomingForm } = require("formidable");
const { promises: fs } = require("fs");
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const cors = require("cors");
bodyParser = require("body-parser");

const os = require('os-utils');

const app = express();
const logger = require("npmlog");
app.use(bodyParser.json()).use(bodyParser.urlencoded());
app.use(cors());

app.post("/upload", async (req, res) => {
  
  logger.info("SERVER", `User Uploading Photos from IP ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}`);
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });

  try {
    const imageFile = data.files.file;
    const imagePath = imageFile.filepath;
    const pathToWriteImage = `./uploads/${uuidv4()}.${imageFile.originalFilename
      .split(".")
      .pop()}`;
    const image = await fs.readFile(imagePath);
    await fs.writeFile(pathToWriteImage, image);
    res.status(200).send({
      message: "success",
      path: pathToWriteImage.slice(1).replace("uploads", "image"),
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
    return;
  }
});

app.get("/list", async (req, res) => {
  try {
    const files = await fs.readdir("./uploads");
    const images = files.map((file) => {
      return {
        name: file,
        path: `image/${file}`,
      };
    });
    res.status(200).send({ images });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.delete("/delete/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    await fs.unlink(`./uploads/${filename}`);
    res.status(200).send({ message: "success" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/image/:filename", (req, res) => {
  const { filename } = req.params;
  const pathToImage = `${__dirname}/uploads/${filename}`;
  res.sendFile(pathToImage);
});

app.get("/info/", (req, res) => {
  var cpu_load=0.0;
  os.cpuUsage( function(value) { cpu_load=value } )
  const data = {
      free_mem: os.freememPercentage(),
      cpu_load: cpu_load,
  }
  res.send(data);
})

app.listen(3001, () => {
  logger.info("SERVER", "Server started at port 3001");
});