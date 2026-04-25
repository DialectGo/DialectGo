import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map(err => err.message).join(', ')
    });
  }

  next();
};

const createValidationMiddleware = (schema) => (req, res, next) => {
    const { error } = schema.validate({
        ...req.body,
        ...req.params,
        ...req.query,
    }, { abortEarly: false, convert: true });

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map((detail) => detail.message).join(', '),
        });
    }

    next();
};

export const validateDictionarySave = createValidationMiddleware(
    Joi.object({
        dictionary_id: Joi.number().integer().positive().required(),
    })
);

export const validateTranslateText = createValidationMiddleware(
    Joi.object({
        sourceText: Joi.string().trim().required(),
        sourceLang: Joi.alternatives().try(Joi.string().trim(), Joi.number().integer()).required(),
        targetLang: Joi.alternatives().try(Joi.string().trim(), Joi.number().integer()).required(),
        source_language_id: Joi.number().integer().optional().allow(null),
        target_language_id: Joi.number().integer().optional().allow(null),
    })
);

export const validateTranslateImage = createValidationMiddleware(
    Joi.object({
        image: Joi.string().trim().required(),
        targetLang: Joi.alternatives().try(Joi.string().trim(), Joi.number().integer()).required(),
        source_language_id: Joi.number().integer().optional().allow(null),
        target_language_id: Joi.number().integer().optional().allow(null),
    })
);

export const validateSessionStart = createValidationMiddleware(
    Joi.object({
        game_id: Joi.number().integer().positive().required(),
    })
);

export const validateSessionComplete = createValidationMiddleware(
    Joi.object({
        session_id: Joi.number().integer().positive().required(),
        accuracy_score: Joi.number().min(0).max(100).required(),
        session_data: Joi.object().optional(),
    })
);

export const validateProgressUpdate = createValidationMiddleware(
    Joi.object({
        xp_gained: Joi.number().min(0).required(),
    })
);

export const validateUserIdParam = createValidationMiddleware(
    Joi.object({
        user_id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
    })
);

export const validateSessionIdParam = createValidationMiddleware(
    Joi.object({
        session_id: Joi.number().integer().positive().required(),
    })
);

export const validateUserTranslationSubmit = createValidationMiddleware(
    Joi.object({
        sourceText: Joi.string().trim().required(),
        userTranslation: Joi.string().trim().required(),
        sourceLang: Joi.alternatives().try(Joi.string().trim(), Joi.number().integer()).required(),
        targetLang: Joi.alternatives().try(Joi.string().trim(), Joi.number().integer()).required(),
        source_language_id: Joi.number().integer().optional().allow(null),
        target_language_id: Joi.number().integer().optional().allow(null),
    })
);
