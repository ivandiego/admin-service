import { Controller, Get, Post, Body } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // // ✅ Buscar eventos disponíveis (Kafka)
  // @MessagePattern('get_available_events')
  // async handleGetAvailableEvents() {
  //   return this.appService.getAvailableEvents();
  // }

  // ✅ Criar evento (Kafka)
  @MessagePattern('create_event')
  async handleCreateEvent(dto: CreateEventDto) {
    const event = await this.appService.createEvent(dto);
    return JSON.parse(JSON.stringify(event)); 
  }

  // ✅ Criar ticket (Kafka)
  @MessagePattern('create_ticket')
  async handleCreateTicket(dto: CreateTicketDto) {
    const ticket = await this.appService.createTicket(dto);
    return JSON.parse(JSON.stringify(ticket)); 
  }
}
