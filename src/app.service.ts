import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Event } from './entities/event.entity';
import { Ticket } from './entities/ticket.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTickettDto } from './dto/update-ticket.dto';


import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,

    @Inject('ADMIN_SERVICE') private readonly salesServiceClient: ClientKafka,
  ) {}

  // ✅ Criar evento
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    const savedEvent = await this.eventRepository.save(event);
    this.salesServiceClient.emit('event_created', savedEvent);
    return savedEvent;
  }

  // ✅ Listar eventos disponíveis
  async getAvailableEvents(): Promise<Event[]> {
    return this.eventRepository.find({ where: { availableTickets: MoreThan(0) } });
  }

  // ✅ Buscar evento por ID
  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  // ✅ Atualizar evento
  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    console.log('updateEventDto' + updateEventDto.name)
    await this.eventRepository.update(id, updateEventDto);
    const updatedEvent = await this.getEventById(id);
    this.salesServiceClient.emit('event_updated', updatedEvent);
    return updatedEvent;
  }

  // ✅ Excluir evento
  async deleteEvent(id: string): Promise<void> {
    const result = await this.eventRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Event with ID ${id} not found`);
    this.salesServiceClient.emit('event_deleted', id);
  }

  // ✅ Criar ticket
  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const event = await this.eventRepository.findOne({ where: { id: createTicketDto.eventId } });

    if (!event) throw new BadRequestException('Event not found');
    if (event.availableTickets < createTicketDto.quantity) {
      throw new BadRequestException('Not enough tickets available');
    }

    const userTickets = await this.ticketRepository.count({
      where: { userId: createTicketDto.userId, event: { id: event.id } },
    });

    if (userTickets + createTicketDto.quantity > 5) {
      throw new BadRequestException('Maximum 5 tickets per user per event');
    }

    event.availableTickets -= createTicketDto.quantity;
    await this.eventRepository.save(event);

    const ticket = this.ticketRepository.create({ ...createTicketDto, event });
    const savedTicket = await this.ticketRepository.save(ticket);
    this.salesServiceClient.emit('ticket_created', savedTicket);

    return savedTicket;
  }

  // ✅ Listar todos os tickets
  async getAllTickets(): Promise<Ticket[]> {
    return this.ticketRepository.find({ relations: ['event'] });
  }

  // ✅ Excluir ticket
  async deleteTicket(id: string): Promise<void> {
    const result = await this.ticketRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Ticket with ID ${id} not found`);
    this.salesServiceClient.emit('ticket_deleted', id);
  }

    // // ✅ Atualizar ticket
    // async updateTicket(id: string, updateEventDto: UpdateTickettDto): Promise<Event> {
    //   console.log('updateEventDto' + updateEventDto.name)
    //   await this.eventRepository.update(id, updateEventDto);
    //   const updatedEvent = await this.getEventById(id);
    //   this.salesServiceClient.emit('event_updated', updatedEvent);
    //   return updatedEvent;
    // }

      // ✅ Listagem de todas as vendas realizadas (tickets comprados)
  async getAllSales(): Promise<Ticket[]> {
    return this.ticketRepository.find({ relations: ['event'] });
  }
}
