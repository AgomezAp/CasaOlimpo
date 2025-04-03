import { Router } from 'express';
import { eliminarUsuarioId, iniciarSesion, reestablecerContraseña, registrarUsuario, obtenerUsuarios } from '../controllers/user';

const router = Router();


router.post('/api/usuario/registrar', registrarUsuario);
router.post('/api/usuario/iniciar-sesion', iniciarSesion);
router.patch('/api/usuario/reestablecer-contrasena',reestablecerContraseña)
router.delete('/api/usuario/eliminar/:Uid', eliminarUsuarioId);
router.get('/api/usuario/obtener', obtenerUsuarios);

export default router;