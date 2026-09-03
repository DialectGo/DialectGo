import Joi from 'joi';

/**
 * User Registration Validation
 */
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),

  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters'
    }),

  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  middleName: Joi.string().allow('', null),

  birthDate: Joi.date().iso().required(),

  // addressLine: Joi.string().min(5).required(),
  country: Joi.string().required(),
  province: Joi.string().required(),
  city: Joi.string().required(),

  username: Joi.string().alphanum().min(3).required(),

  preferredLanguageCode: Joi.string().optional(),
  
  redirectUrl: Joi.string().uri().optional()
});

/**
 * User Login Validation
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});