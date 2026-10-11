import { DocumentBuilder } from '@nestjs/swagger';

export const buildSwaggerConfig = () =>
  new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('None')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Pegar el accessToken que devuelve POST /auth/login',
    })
    .build();
