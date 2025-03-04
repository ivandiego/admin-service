import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // ✅ Criar evento (Kafka)
  @MessagePattern('create_event')
  async handleCreateEvent(dto: CreateEventDto) {
    const event = await this.appService.createEvent(dto);
    return JSON.parse(JSON.stringify(event));
  }

  // ✅ Listar eventos disponíveis (Kafka)
  @MessagePattern('get_available_events')
  async handleGetAvailableEvents() {
    return await this.appService.getAvailableEvents();
  }

  // ✅ Buscar evento por ID (Kafka)
  @MessagePattern('get_event_by_id')
  async handleGetEventById(id: string) {
    const event = await this.appService.getEventById(id);
    return JSON.parse(JSON.stringify(event));

  }

  // ✅ Atualizar evento (Kafka)
  @MessagePattern('update_event')
  async handleUpdateEvent(data: { id: string; updateEventDto: UpdateEventDto }) {
    const ticket = await this.appService.updateEvent(data.id, data.updateEventDto);
    return JSON.parse(JSON.stringify(ticket));

  }

  // ✅ Excluir evento (Kafka)
  @MessagePattern('delete_event')
  async handleDeleteEvent(id: string) {
    return await this.appService.deleteEvent(id);
  }

  // ✅ Criar ticket (Kafka)
  @MessagePattern('create_ticket')
  async handleCreateTicket(dto: CreateTicketDto) {
    const ticket = await this.appService.createTicket(dto);
    return JSON.parse(JSON.stringify(ticket));
  }

  // ✅ Listar todos os tickets (Kafka)
  @MessagePattern('get_tickets')
  async handleGetAllTickets() {
    return await this.appService.getAllTickets();
  }

  // ✅ Excluir ticket por ID (Kafka)
  @MessagePattern('delete_ticket')
  async handleDeleteTicket(id: string) {
    return await this.appService.deleteTicket(id);
  }
}
