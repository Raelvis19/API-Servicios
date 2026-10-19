import "dotenv/config";
import express from "express";

import servicioRoutes from "./routes/servicio.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares generales
app.use(express.json());
app.use(loggerMiddleware);

// Ruta de bienvenida para comprobar que la API funciona
app.get("/", (req, res) => {
  res.status(200).json({
    mensaje: "API de servicios funcionando correctamente"
  });
});

// Rutas de la API
app.use("/auth", authRoutes);
app.use("/servicios", servicioRoutes);

// Manejo de errores centralizado
app.use((err, req, res, next) => {
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
