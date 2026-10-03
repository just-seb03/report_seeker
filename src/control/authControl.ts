/***********************************************************************************************
 ***                               C O N F I D E N T I A L  ---  M C S                       ***
 ***********************************************************************************************
 *                                                                                             *
 *                 Proyecto : proyecto_minera                                                  *
 *                                                                                             *
 *                  Archivo : authControl.ts                                                   *
 *                                                                                             *
 *              Programador : Sebastian Arredondo                                              *
 *                                                                                             *
 *          Fecha de Inicio : 03 de Octubre de 2026                                            *
 *                                                                                             *
 *     Última Actualización : 03 de Octubre de 2026 [SA]                                       *
 *                                                                                             *
 *---------------------------------------------------------------------------------------------*
 * Funciones:                                                                                  *
 *   seedTrabajadores -- Poblado de datos semilla en Firebase si no hay trabajadores.          *
 *   loginWithFirebase -- Validación de credenciales y creación de la sesión local.            *
 *   getCurrentUser -- Obtiene el usuario activo actualmente logueado.                         *
 *   logout -- Cierra la sesión activa actual del trabajador.                                  *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */

import { db } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { insertOrUpdateTrabajadorLocal } from '../database';

export interface Trabajador {
  trabajador_id: number;
  nombre: string;
  email: string;
  pin: string;
}

// Semilla inicial (solo para poblar Firebase por primera vez si no existen)
export async function seedTrabajadores() {
  const trabajadores: Trabajador[] = [
    { trabajador_id: 10482, nombre: 'Sebastian Arredondo', email: 'seb.arredondo@proton.me', pin: '8080' },
    { trabajador_id: 29531, nombre: 'Cristian Vega', email: 'cristianvegagallardo@gmail.com', pin: '2005' },
    { trabajador_id: 34910, nombre: 'Maximiliano Cantuarias', email: 'maximiliano.cantuarias@gmail.com', pin: '2000' }
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
  try {
    const q = query(
      collection(db, 'trabajadores'),
      where('trabajador_id', '==', trabajador_id),
      where('pin', '==', pin)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const trabajador = snapshot.docs[0].data() as Trabajador;
      
      // Guardar sesión activa localmente
      localStorage.setItem('logged_in_user', JSON.stringify(trabajador));
      
      // Guardar en la DB de SQLite para satisfacer la Foreign Key de los reportes
      await insertOrUpdateTrabajadorLocal(trabajador);
      
      return trabajador;
    }
    return null;
  } catch (error) {
    console.error("❌ [Auth] Error en login:", error);
    return null;
  }
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

export function logout() {
  localStorage.removeItem('logged_in_user');
  sessionStorage.setItem('skip_welcome', 'true');
  window.dispatchEvent(new CustomEvent('user_logout'));
}
