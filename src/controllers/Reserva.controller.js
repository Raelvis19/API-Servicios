import { prisma } from "../db.js";

// POST /reservas - Crear reserva (cualquier usuario autenticado)
export const createReserva = async (req, res) => {
  try {
    const { servicioId, fecha } = req.body;
    const usuarioId = req.usuario.id;

    if (!servicioId || !fecha) {
      return res.status(400).json({
        mensaje: "servicioId y fecha son obligatorios"
      });
    }

    const servicioIdNum = Number(servicioId);
    if (!Number.isInteger(servicioIdNum) || servicioIdNum <= 0) {
      return res.status(400).json({
        mensaje: "servicioId no es válido"
      });
    }

    const fechaDate = new Date(fecha);
    if (isNaN(fechaDate.getTime())) {
      return res.status(400).json({
        mensaje: "fecha no es válida"
      });
    }

    // Verificar que el servicio existe
    const servicio = await prisma.servicio.findUnique({
      where: { id: servicioIdNum }
    });
    if (!servicio) {
      return res.status(404).json({
        mensaje: "El servicio no existe"
      });
    }

    const reserva = await prisma.reserva.create({
      data: {
        usuarioId,
        servicioId: servicioIdNum,
        fecha: fechaDate
      },
      include: {
        servicio: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      mensaje: "Reserva creada correctamente",
      reserva
    });
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return res.status(500).json({
      mensaje: "Error al crear la reserva"
    });
  }
};

// GET /reservas/mis-reservas - Mis reservas (cliente)
export const getMisReservas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const reservas = await prisma.reserva.findMany({
      where: { usuarioId },
      include: {
        servicio: true
      },
      orderBy: {
        fecha: "asc"
      }
    });

    return res.status(200).json(reservas);
  } catch (error) {
    console.error("Error al obtener mis reservas:", error);
    return res.status(500).json({
      mensaje: "Error al obtener las reservas"
    });
  }
};

// GET /reservas - Todas las reservas (admin)
export const getReservas = async (req, res) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: {
        servicio: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      },
      orderBy: {
        fecha: "asc"
      }
    });

    return res.status(200).json(reservas);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return res.status(500).json({
      mensaje: "Error al obtener las reservas"
    });
  }
};

// PUT /reservas/:id/estado - Cambiar estado de reserva (admin)
export const updateEstadoReserva = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la reserva no es válido"
      });
    }

    const estadosValidos = ["pendiente", "confirmada", "cancelada"];
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({
        mensaje: "Estado no válido. Debe ser: pendiente, confirmada o cancelada"
      });
    }

    const reserva = await prisma.reserva.update({
      where: { id },
      data: { estado },
      include: {
        servicio: true,
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      mensaje: "Estado de reserva actualizado correctamente",
      reserva
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensaje: "La reserva no existe"
      });
    }

    console.error("Error al actualizar estado de reserva:", error);
    return res.status(500).json({
      mensaje: "Error al actualizar el estado de la reserva"
    });
  }
};

// DELETE /reservas/:id - Cancelar reserva (propietario o admin)
export const deleteReserva = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const usuarioId = req.usuario.id;
    const rol = req.usuario.rol;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID de la reserva no es válido"
      });
    }

    const reserva = await prisma.reserva.findUnique({
      where: { id }
    });

    if (!reserva) {
      return res.status(404).json({
        mensaje: "La reserva no existe"
      });
    }

    // Solo el propietario o un admin pueden cancelar
    if (reserva.usuarioId !== usuarioId && rol !== "admin") {
      return res.status(403).json({
        mensaje: "No tienes permiso para cancelar esta reserva"
      });
    }

    await prisma.reserva.delete({
      where: { id }
    });

    return res.status(200).json({
      mensaje: "Reserva cancelada correctamente"
    });
  } catch (error) {
    console.error("Error al cancelar reserva:", error);
    return res.status(500).json({
      mensaje: "Error al cancelar la reserva"
    });
  }
};
