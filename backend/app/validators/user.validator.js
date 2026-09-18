import Joi from 'joi';

/**
 * User Registration Validation
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().max(254).required(),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must include an uppercase letter, a lowercase letter, and a number'
    }),

  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  middleName: Joi.string().trim().max(50).allow('', null),

  birthDate: Joi.date().iso().max('now').required(),

  country: Joi.string().trim().max(100).required(),
  province: Joi.string().trim().max(100).required(),
  city: Joi.string().trim().max(100).required(),

  username: Joi.string()
    .trim()
    .pattern(/^[a-zA-Z0-9._-]+$/)
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.pattern.base': 'Username can only contain letters, numbers, dots, underscores, and hyphens'
    }),

  preferredLanguageCode: Joi.string().trim().optional()
});

/**
 * User Login Validation
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required()
});