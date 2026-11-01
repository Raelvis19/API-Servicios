
import { Router } from "express";

import { registro, login, actualizarPerfil } from "../controllers/auth.controller.js";
import { verificarToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Rutas públicas de autenticación
router.post("/registro", registro);
router.post("/login", login);

// Ruta protegida
router.put("/perfil", verificarToken, actualizarPerfil);

export default router;
