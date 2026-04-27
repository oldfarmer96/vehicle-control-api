import * as Joi from 'joi';

export const envSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  PORT: Joi.number().port().default(4000),
  NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
  CORS_ORIGINS: Joi.string().required(),
  API_PREFIX: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  COOKIE_NAME: Joi.string().required(),
  COOKIE_SECRET: Joi.string().required(),
  CAMERA_WEBHOOK_KEY: Joi.string().required(),
  TOKEN_JSON_API: Joi.string().required(),
  URL_PLACA_API: Joi.string().required(),
});
