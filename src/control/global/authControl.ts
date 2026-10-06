/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : authControl.ts                                                   *
 *                                                                                             *
 *              Programador :Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización :04 de Octubre de 2026 [CV]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   seedTrabajadores -- Poblado de datos semilla en Firebase si no hay trabajadores.          *
 *   loginWithFirebase -- Validación de credenciales y creación de la sesión local.            *
 *   getCurrentUser -- Obtiene el usuario activo actualmente logueado.                         *
 *   logout -- Cierra la sesión activa actual del trabajador.                                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { insertOrUpdateTrabajadorLocal } from '../../database';

export interface Trabajador {
  trabajador_id: number;
  nombre: string;
  email: string;
  pin: string;
  es_prevencionista?: boolean;
  foto_url?: string | null;
}

// Semilla inicial (solo para poblar Firebase por primera vez si no existen)
export async function seedTrabajadores() {
  const trabajadores: Trabajador[] = [
    { trabajador_id: 10482, nombre: 'Sebastian Arredondo', email: 'seb.arredondo@proton.me', pin: '8080', es_prevencionista: false },
    { trabajador_id: 29531, nombre: 'Cristian Vega', email: 'cristianvegagallardo@gmail.com', pin: '2005', es_prevencionista: false },
    { trabajador_id: 34910, nombre: 'Maximiliano Cantuarias', email: 'maximiliano.cantuarias@gmail.com', pin: '2000', es_prevencionista: false },
    // Agregamos un prevencionista de prueba
    { trabajador_id: 99999, nombre: 'Prevencionista Jefe', email: 'prevencion@minera.cl', pin: '1234', es_prevencionista: true }
  ];

  try {
    for (const t of trabajadores) {
      await setDoc(doc(db, 'trabajadores', t.trabajador_id.toString()), t);
    }
    console.log("✅ [Auth] Trabajadores de prueba inyectados en Firebase");
  } catch (error) {
    console.error("❌ [Auth] Error inyectando trabajadores:", error);
  }
}

export async function loginWithFirebase(trabajador_id: number, pin: string): Promise<Trabajador | null> {
  let snapshot;
  try {
    const q = query(
      collection(db, 'trabajadores'),
      where('trabajador_id', '==', trabajador_id),
      where('pin', '==', pin)
    );

    snapshot = await getDocs(q);
  } catch (error) {
    console.error('❌ [Auth] No se pudieron validar las credenciales en Firebase:', error);
    throw new Error('No se pudo conectar con Firebase para validar las credenciales.', { cause: error });
  }

  if (snapshot.empty) return null;

  const trabajador = snapshot.docs[0].data() as Trabajador;

  // Una falla de caché local no debe invalidar unas credenciales válidas en Firebase.
  localStorage.setItem('logged_in_user', JSON.stringify(trabajador));
  try {
    await insertOrUpdateTrabajadorLocal(trabajador);
  } catch (error) {
    console.error('❌ [Auth] Login validado, pero no se pudo sincronizar el trabajador en SQLite:', error);
  }

  return trabajador;
}

export function getCurrentUser(): Trabajador | null {
  const data = localStorage.getItem('logged_in_user');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function updateUserLocal(user: Trabajador) {
  localStorage.setItem('logged_in_user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('user_updated', { detail: user }));
}

export function logout() {
  localStorage.removeItem('logged_in_user');
  sessionStorage.setItem('skip_welcome', 'true');
  window.dispatchEvent(new CustomEvent('user_logout'));
}
