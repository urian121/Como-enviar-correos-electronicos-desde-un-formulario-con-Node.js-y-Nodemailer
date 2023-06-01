//Requiriendo el módulo 'express'
const express = require("express");
const bodyParser = require("body-parser");

//Importando la biblioteca nodemailer en tu archivo
const nodemailer = require("nodemailer");
//Módulo multer para manejar la carga de archivos
const multer = require("multer");

//Creando una nueva aplicación Express.
const app = express();
const path = require("path");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * app.use Se utiliza para montar middlewares en la aplicación Express.
 * Los middlewares son funciones que se ejecutan en el flujo de procesamiento de una solicitud antes
 * de que se envíe una respuesta Middleware para servir archivos estáticos desde la carpeta "public"
 */
app.use("/public", express.static(path.join(__dirname, "public")));

/**
 * Establecer EJS como el Motor de plantillas
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/**
 * Definiendo mi ruta Home
 */
app.get("/", (req, res) => {
  res.render("inicio");
});

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "files_emails")); // Ruta donde se guardarán los archivos adjuntos
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// Configuración del servicio de correo electrónico
const transporter = nodemailer.createTransport({
  /**
   * Para utilizar otro servicio de correo electrónico, como Yahoo o Outlook, debes
   * cambiar el valor de la propiedad service y ajustar la configuración de autenticación correspondiente.
   */
  service: "gmail",
  auth: {
    user: "urianwebdeveloper@gmail.com",
    pass: "tcgsaaiuilyreuzc",
  },
});

app.post("/procesar-email", upload.single("fileAdjunto"), (req, res) => {
  const { desde, para, titulo, mensaje } = req.body;
  const fileAdjunto = req.file;

  // Verificar si se adjuntó un archivo
  let attachments = [];
  if (fileAdjunto) {
    // Ruta absoluta donde se guarda el archivo adjunto
    const filePath = path.join(__dirname, "files_emails", fileAdjunto.filename);

    attachments = [
      {
        filename: fileAdjunto.name,
        path: filePath,
      },
    ];
  }

  // Definir el contenido del cuepro para el correo electrónico que deseas enviar
  const mailOptions = {
    from: desde,
    to: para,
    subject: titulo,
    text: mensaje,
    attachments: attachments,
  };
  // Envía el correo electrónico utilizando el método sendMail del objeto transporter
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error al enviar el correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });

  res.render("inicio");
});

// Iniciar el servidor con Express
const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
