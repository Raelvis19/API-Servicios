import { Router } from "express";

import {
  createReserva,
  getMisReservas,
  getReservas,
  updateEstadoReserva,
  deleteReserva
} from "../controllers/Reserva.controller.js";

import { verificarToken, soloAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

// Cualquier usuario autenticado puede crear reserva
router.post("/", verificarToken, createReserva);

// Usuario autenticado ve sus propias reservas
router.get("/mis-reservas", verificarToken, getMisReservas);

// Solo admin ve todas las reservas
router.get("/", verificarToken, soloAdmin, getReservas);

// Solo admin cambia estado
router.put("/:id/estado", verificarToken, soloAdmin, updateEstadoReserva);

// Propietario o admin puede cancelar
router.delete("/:id", verificarToken, deleteReserva);

export default router;
