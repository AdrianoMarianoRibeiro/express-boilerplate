import 'reflect-metadata';
import { config } from 'dotenv';

// Carrega as variáveis de ambiente PRIMEIRO
config();

// Configurar timezone para o Brasil
process.env.TZ = 'America/Sao_Paulo';

import { ExpressApplication } from './core/application';
import { AppModule } from './modules/app.module';
import AppDataSource from './database/database.config';

async function bootstrap() {
  const app = new ExpressApplication();

  try {
    await app.bootstrap(AppModule, AppDataSource);

    const port = parseInt(process.env.PORT || '3000');

    app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(
      `📚 Swagger docs available at: http://localhost:${port}/api-docs`,
    );
    console.log(
      `⏰ Server timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    );
    console.log(
      `🕐 Current time: ${new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
      })}`,
    );
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
