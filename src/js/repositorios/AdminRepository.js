import { db } from '../modules/db.js';

export const AdminRepository = {
  async obtenerAuditoria(limite) { return db.obtenerAuditoria(limite); },
  async verificarRls() { return db.verificarRls(); },
  async verificarCirculacion() { return db.verificarCirculacion(); },
  async obtenerRespaldos(limite) { return db.obtenerRespaldos(limite); },
  async purgarDatosAntiguos() { return db.purgarDatosAntiguos(); },
  async evidenciaIncidente(desde, hasta) { return db.evidenciaIncidente(desde, hasta); },
  async resumenErrores() { return db.resumenErrores(); },
  async listarErrores(limite, mostrarResueltos) { return db.listarErrores(limite, mostrarResueltos); },
  async verificarDefiniciones() { return db.verificarDefiniciones(); },
  async marcarErrorVisto(id) { return db.marcarErrorVisto(id); },
  async purgarErrores(dias) { return db.purgarErrores(dias); },
  async listarEnlacesEscaneo() { return db.listarEnlacesEscaneo(); },
  async revocarEnlaceEscaneo(id) { return db.revocarEnlaceEscaneo(id); }
};
