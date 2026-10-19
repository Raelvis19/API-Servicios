
import { prisma } from "../db.js";

// GET /servicios
export const getServicios = async (req, res) => {
  try {
    const servicios = await prisma.servicio.findMany();

    return res.status(200).json(servicios);
  } catch (error) {
    console.error("Error al listar servicios:", error);

    return res.status(500).json({
      mensaje: "Error al obtener los servicios"
    });
  }
};

// POST /servicios
export const createServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion, precio } = req.body;

    // Validar campos obligatorios
    if (!nombre || !descripcion || duracion == null || precio == null) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios"
      });
    }

    // Validar duración
    if (!Number.isInteger(duracion) || duracion <= 0) {
      return res.status(400).json({
        mensaje: "La duración debe ser un número entero mayor que 0"
      });
    }

    // Validar precio
    if (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0) {
      return res.status(400).json({
        mensaje: "El precio debe ser un número válido mayor o igual a 0"
      });
    }

    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre,
        descripcion,
        duracion,
        precio
      }
    });

    return res.status(201).json({
      mensaje: "Servicio creado correctamente",
      servicio: nuevoServicio
    });
  } catch (error) {
    console.error("Error al crear servicio:", error);

    return res.status(500).json({
      mensaje: "Error al crear el servicio"
    });
  }
};

// PUT /servicios/:id
export const updateServicio = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID del servicio no es válido"
      });
    }

    const { nombre, descripcion, duracion, precio } = req.body;

    if (!nombre || !descripcion || duracion == null || precio == null) {
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios"
      });
    }

    if (!Number.isInteger(duracion) || duracion <= 0) {
      return res.status(400).json({
        mensaje: "La duración debe ser un número entero mayor que 0"
      });
    }

    if (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0) {
      return res.status(400).json({
        mensaje: "El precio debe ser un número válido mayor o igual a 0"
      });
    }

    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombre,
        descripcion,
        duracion,
        precio
      }
    });

    return res.status(200).json({
      mensaje: "Servicio actualizado correctamente",
      servicio: servicioActualizado
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensaje: "El servicio no existe"
      });
    }

    console.error("Error al actualizar servicio:", error);

    return res.status(500).json({
      mensaje: "Error al actualizar el servicio"
    });
  }
};

// DELETE /servicios/:id
export const deleteServicio = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "El ID del servicio no es válido"
      });
    }

    await prisma.servicio.delete({
      where: { id }
    });

    return res.status(200).json({
      mensaje: "Servicio eliminado correctamente"
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        mensaje: "El servicio no existe"
      });
    }

    console.error("Error al eliminar servicio:", error);

    return res.status(500).json({
      mensaje: "Error al eliminar el servicio"
    });
  }
};
