import { describe, it, expect, beforeEach } from 'vitest';
import UIManager from '../ui-base.js';

describe('UIManager - Utilidades y Validadores', () => {
    let ui;

    beforeEach(() => {
        ui = new UIManager();
    });

    describe('formatRut', () => {
        it('debe limpiar y formatear un RUT sin puntos ni guión', () => {
            expect(ui.formatRut('123456789')).toBe('12.345.678-9');
            expect(ui.formatRut('12345678K')).toBe('12.345.678-K');
            expect(ui.formatRut('12345678k')).toBe('12.345.678-K'); // fuerza mayúscula
        });

        it('debe mantener RUTs ya formateados', () => {
            expect(ui.formatRut('12.345.678-9')).toBe('12.345.678-9');
        });

        it('debe fallar con gracia si el RUT está vacío', () => {
            expect(ui.formatRut('')).toBe('');
            expect(ui.formatRut(null)).toBe('');
        });
    });

    describe('isValidRut', () => {
        it('debe validar RUTs correctos', () => {
            expect(ui.isValidRut('12.345.678-5')).toBe(true);
            expect(ui.isValidRut('12345678-5')).toBe(true);
            expect(ui.isValidRut('123456785')).toBe(true);
            expect(ui.isValidRut('1-9')).toBe(true); // Ejemplo básico válido
        });

        it('debe rechazar RUTs incorrectos por dígito verificador', () => {
            expect(ui.isValidRut('12.345.678-0')).toBe(false);
            expect(ui.isValidRut('12345678-K')).toBe(false);
        });

        it('debe rechazar RUTs mal formados', () => {
            expect(ui.isValidRut('12.345')).toBe(false);
            expect(ui.isValidRut('ABCDEFGH-I')).toBe(false);
            expect(ui.isValidRut('')).toBe(false);
            expect(ui.isValidRut(null)).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('debe validar correos con formato correcto', () => {
            expect(ui.isValidEmail('test@municipalidad.cl')).toBe(true);
            expect(ui.isValidEmail('a.b@c.com')).toBe(true);
        });

        it('debe rechazar correos con formato incorrecto', () => {
            expect(ui.isValidEmail('test@')).toBe(false);
            expect(ui.isValidEmail('test.com')).toBe(false);
            expect(ui.isValidEmail('test@municipalidad')).toBe(false);
            expect(ui.isValidEmail('')).toBe(false);
        });
    });
});
