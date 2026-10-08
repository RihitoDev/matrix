import { z } from 'zod';

const REQUIRED = 'Este campo es obligatorio';

export const createJobOfferSchema = z
  .object({
    tituloPuesto: z
      .string()
      .trim()
      .min(1, REQUIRED)
      .max(60, 'El titulo del puesto no debe exceder los 60 caracteres')
      .regex(
        /^[a-zA-Z0-9\sÁÉÍÓÚÜÑáéíóúüñ]+$/,
        'Solo se permiten caracteres alfanumericos y espacios',
      ),
    descripcion: z
      .string()
      .trim()
      .min(1, REQUIRED)
      .max(3000, 'La descripcion no debe exceder los 3000 caracteres'),
    modalidad: z.enum(['Presencial', 'Remoto', 'Híbrido'], {
      message: 'Modalidad invalida',
    }),
    ubicacion: z.string().trim().min(1, REQUIRED),
    tipoContrato: z.enum(['Tiempo completo', 'Medio tiempo', 'Pasantía'], {
      message: 'Tipo de contrato invalido',
    }),
    categoria: z.string().trim().min(1, REQUIRED),
    numeroVacantes: z
      .number()
      .int('Debe ser un numero entero')
      .min(1, 'Debe ser al menos 1')
      .max(500, 'El numero maximo de vacantes por publicacion es 500'),
    salarioMin: z.number().int().nonnegative(),
    salarioMax: z.number().int().nonnegative().optional(),
    idiomas: z
      .string()
      .trim()
      .min(1, REQUIRED)
      .max(100, 'Los idiomas no deben exceder los 100 caracteres'),
    enlaceGoogleMaps: z
      .string()
      .trim()
      .min(1, REQUIRED)
      .regex(
        /^https:\/\/(maps\.google\.com\/|goo\.gl\/maps\/)/,
        'Ingresa un enlace valido de Google Maps',
      ),
    tecnologias: z
      .array(z.uuid())
      .min(1, 'Debes seleccionar al menos una habilidad requerida')
      .max(10, 'Se alcanzo el tope de tecnologias'),
  })
  .refine(
    (data) => data.salarioMax === undefined || data.salarioMin <= data.salarioMax,
    {
      path: ['salarioMin'],
      message: 'El salario minimo no puede ser mayor al salario maximo',
    },
  );

export type CreateJobOfferPayload = z.infer<typeof createJobOfferSchema>;