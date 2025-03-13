import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { Event } from './entities/event.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketOrder } from './entities/order-ticket.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'example',
      database: process.env.DB_NAME || 'ticket_system',
      entities: [Event, Ticket, TicketOrder],
      synchronize: true, // ⚠️ Apenas para desenvolvimento
    }),

    TypeOrmModule.forFeature([Event, Ticket, TicketOrder]), // Importando os repositórios

    ClientsModule.register([
      {
        name: 'ADMIN_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['kafka:9092'],
          },
          consumer: {
            groupId: 'admin-service',
          },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
