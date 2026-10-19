
import { Router } from "express";

import {
  getServicios,
  createServicio,
  updateServicio,
  deleteServicio
} from "../controllers/Servicio.controller.js";

import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Solo usuarios autenticados
router.get("/", verificarToken, getServicios);

// Solo administradores
router.post("/", verificarToken, soloAdmin, createServicio);
router.put("/:id", verificarToken, soloAdmin, updateServicio);
router.delete("/:id", verificarToken, soloAdmin, deleteServicio);

export default router;
