import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';//./entities/event.entity
import { Ticket } from './entities/ticket.entity';//./entities/ticket.entity
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,

    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,

    @Inject('SALES_SERVICE') private readonly salesServiceClient: ClientKafka,
  ) {}

  // **Criar um novo evento**
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const event = this.eventRepository.create(createEventDto);
    const savedEvent = await this.eventRepository.save(event);

    // Publicando evento no Kafka para notificar os microserviços interessados
    this.salesServiceClient.emit('event_created', savedEvent);

    return savedEvent;
  }

  // **Listar todos os eventos**
  async getAllEvents(): Promise<Event[]> {
    return this.eventRepository.find();
  }

  // **Buscar evento por ID**
  async getEventById(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException(`Event with ID ${id} not found`);
    return event;
  }

  // **Criar um novo ticket**
  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(createTicketDto);
    const savedTicket = await this.ticketRepository.save(ticket);

    // Publicando evento no Kafka para notificar os microserviços interessados
    this.salesServiceClient.emit('ticket_created', savedTicket);

    return savedTicket;
  }

  // **Listar todos os tickets**
  async getAllTickets(): Promise<Ticket[]> {
    return this.ticketRepository.find();
  }

  // **Buscar ticket por ID**
  async getTicket(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);
    return ticket;
  }
}
