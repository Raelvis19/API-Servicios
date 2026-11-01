import { prisma } from "../db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export const registro = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "nombre, email y password son obligatorios" })
    }

    const existe = await prisma.usuario.findUnique({ where: { email } })
    if (existe) return res.status(400).json({ error: "Email ya registrado" })

    const hash = await bcrypt.hash(password, 10)
    // El rol siempre es "cliente": nunca se toma del body para evitar
    // que un usuario se registre a sí mismo como admin.
    const usuario = await prisma.usuario.create({
      data: { nombre, email, password: hash, rol: "cliente" }
    })
    res.status(201).json({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol })
  } catch (err) { next(err) }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const usuario = await prisma.usuario.findUnique({ where: { email } })
    if (!usuario) return res.status(401).json({ error: "Credenciales inválidas" })

    const valido = await bcrypt.compare(password, usuario.password)
    if (!valido) return res.status(401).json({ error: "Credenciales inválidas" })

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    )
    res.json({ token })
  } catch (err) { next(err) }
}

export const actualizarPerfil = async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id
    const { nombre } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ error: "El nombre es obligatorio" })
    }

    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { nombre: nombre.trim() },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true
      }
    })

    return res.status(200).json(usuario)
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }
    console.error("Error al actualizar perfil:", error)
    return res.status(500).json({ error: "Error al actualizar el perfil" })
  }
}