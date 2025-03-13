import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Event } from './entities/event.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketOrder } from './entities/order-ticket.entity';

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

    @InjectRepository(TicketOrder)
    private orderRepository: Repository<TicketOrder>,

    @Inject('ADMIN_SERVICE') private readonly salesServiceClient: ClientKafka,
  ) { }

  // // ✅ Criar evento
  // async createEvent(data: { userId: string; eventId: string;}): Promise<Event> {
  //   console.log("createEvent", JSON.stringify(data))

  //     // 🔥 Adiciona totalTickets = availableTickets na criação do evento
  // const event = this.eventRepository.create(data);

  //   const savedEvent = await this.eventRepository.save(event);
  //   this.salesServiceClient.emit('event_created', savedEvent);
  //   return savedEvent;
  // }
  async createEvent(data: { 
    userId: string; 
    name: string; 
    availableTickets: number;
    totalTickets?: number; // Opcional, pois podemos definir como `availableTickets`
  }): Promise<Event> {
    console.log("🟢 Creating event:", JSON.stringify(data));
  
    // 🔥 Definir `totalTickets` se não for passado
    const totalTickets = data.totalTickets ?? data.availableTickets;
  
    // 🔹 Criar novo evento com todas as propriedades necessárias
    const event = this.eventRepository.create({
      name: data.name,
      availableTickets: 0,
      totalTickets: 0,
      soldTickets: 0, // Novo evento começa com 0 ingressos vendidos
    });
  
    // 🔹 Salvar evento no banco
    const savedEvent = await this.eventRepository.save(event);
  
    // 🔥 Emitir evento via Kafka ou outro serviço de mensagens
    this.salesServiceClient.emit('event_created', savedEvent);
  
    console.log("✅ Event created successfully:", JSON.stringify(savedEvent));
  
    return savedEvent;
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

  async createAvailableTickets(dto: CreateTicketDto): Promise<Ticket> {
    console.log("🔵 Creating available tickets for event:", dto.eventId);
  
    const event = await this.eventRepository.findOne({ where: { id: dto.eventId } });
  
    if (!event) {
      throw new BadRequestException('Event not found');
    }
  
    // Atualiza os ingressos disponíveis no evento
    event.availableTickets += dto.quantity;
    event.totalTickets += dto.quantity; // Opcional, se quiser acompanhar o total de ingressos criados
  
    await this.eventRepository.save(event);
  
    console.log(`✅ ${dto.quantity} tickets added to event ${event.id}`);
  
    return {
      eventId: event.id,
      quantity: dto.quantity,
    } as unknown as Ticket;
  }

  // // ✅ Criar ticket
  // async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
  //   const event = await this.eventRepository.findOne({ where: { id: createTicketDto.eventId } });

  //   if (!event) throw new BadRequestException('Event not found');
  //   if (event.availableTickets < createTicketDto.quantity) {
  //     throw new BadRequestException('Not enough tickets available');
  //   }

  //   const userTickets = await this.ticketRepository.count({
  //     where: { userId: createTicketDto.userId, event: { id: event.id } },
  //   });

  //   if (userTickets + createTicketDto.quantity > 5) {
  //     throw new BadRequestException('Maximum 5 tickets per user per event');
  //   }

  //   event.availableTickets -= createTicketDto.quantity;
  //   event.soldTickets += createTicketDto.quantity; // ✅ Agora atualiza o número de ingressos vendidos

  //   await this.eventRepository.save(event);

  //   const ticket = this.ticketRepository.create({ ...createTicketDto, event });
  //   const savedTicket = await this.ticketRepository.save(ticket);
  //   // this.salesServiceClient.emit('ticket_created', savedTicket);

  //   return savedTicket;
  // }

  // async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
  //   console.log(`🟢 Processing ticket purchase for user: ${createTicketDto.userId}, Event: ${createTicketDto.eventId}`);
  
  //   const event = await this.eventRepository.findOne({ where: { id: createTicketDto.eventId } });
  
  //   if (!event) {
  //     throw new BadRequestException('Event not found');
  //   }
  
  //   if (event.availableTickets < createTicketDto.quantity) {
  //     throw new BadRequestException('Not enough tickets available');
  //   }
  
  //   // 🔹 Corrigido: Garantindo que userTicketsCount sempre retorne 0 se for nulo
  //   const userTicketsCount = await this.ticketRepository
  //     .createQueryBuilder("ticket")
  //     .select("COALESCE(SUM(ticket.quantity), 0)", "total")
  //     .where("ticket.userId = :userId", { userId: createTicketDto.userId })
  //     .andWhere("ticket.eventId = :eventId", { eventId: createTicketDto.eventId })
  //     .getRawOne();
  
  //   const currentUserTickets = Number(userTicketsCount?.total) || 0; // Garantindo que não seja undefined/null
  //   const totalUserTickets = currentUserTickets + createTicketDto.quantity;
  
  //   console.log(`👤 User already has ${currentUserTickets} tickets, attempting to buy ${createTicketDto.quantity}. Total after purchase: ${totalUserTickets}`);
  
  //   if (totalUserTickets > 5) {
  //     throw new BadRequestException(`Maximum 5 tickets per user per event. You already have ${currentUserTickets} tickets.`);
  //   }
  
  //   // Atualizar a quantidade de ingressos disponíveis e vendidos
  //   event.availableTickets -= createTicketDto.quantity;
  //   event.soldTickets += createTicketDto.quantity;
  
  //   await this.eventRepository.save(event);
  
  //   const ticket = this.ticketRepository.create({ ...createTicketDto, event });
  //   const savedTicket = await this.ticketRepository.save(ticket);
  
  //   console.log(`✅ Ticket purchase successful for user: ${createTicketDto.userId}, Event: ${createTicketDto.eventId}. User now has ${totalUserTickets} tickets.`);
  
  //   return savedTicket;
  // }
  
  async createTicket(createTicketDto: CreateTicketDto): Promise<Ticket> {
    console.log(`🟢 Processing ticket purchase for user: ${createTicketDto.userId}, Event: ${createTicketDto.eventId}`);
  
    const event = await this.eventRepository.findOne({ where: { id: createTicketDto.eventId } });
  
    if (!event) throw new BadRequestException('Event not found');
    if (event.availableTickets < createTicketDto.quantity) throw new BadRequestException('Not enough tickets available');
  
    const userTicketsCount = await this.ticketRepository
      .createQueryBuilder("ticket")
      .select("COALESCE(SUM(ticket.quantity), 0)", "total")
      .where("ticket.userId = :userId", { userId: createTicketDto.userId })
      .andWhere("ticket.eventId = :eventId", { eventId: createTicketDto.eventId })
      .getRawOne();
  
    const currentUserTickets = Number(userTicketsCount?.total) || 0;
    const totalUserTickets = currentUserTickets + createTicketDto.quantity;
  
    if (totalUserTickets > 5) {
      throw new BadRequestException(`Maximum 5 tickets per user per event. You already have ${currentUserTickets} tickets.`);
    }
  
    // 🔥 Salvar venda na tabela `ticket_order`
    const ticketOrder = this.orderRepository.create({
      userId: createTicketDto.userId,
      eventId: createTicketDto.eventId,
      quantity: createTicketDto.quantity,
    });
  
    await this.orderRepository.save(ticketOrder); // 🚀 Agora salva corretamente no banco
  
    event.availableTickets -= createTicketDto.quantity;
    event.soldTickets += createTicketDto.quantity;
  
    await this.eventRepository.save(event);
  
    const ticket = this.ticketRepository.create({ ...createTicketDto, event });
    const savedTicket = await this.ticketRepository.save(ticket);
  
    console.log(`✅ Ticket purchase successful for user: ${createTicketDto.userId}, Event: ${createTicketDto.eventId}. User now has ${totalUserTickets} tickets.`);
  
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

  // async getAllSales(): Promise<TicketOrder[]> {
  //   try {
  //     console.log("🟡 Fetching all ticket sales from the database...");
  
  //     const sales = await this.orderRepository.find({
  //       relations: ['event'], // 🔥 Garante que a relação está correta } // 🔥 Retorna as vendas mais recentes primeiro
  //     });
  
  //     console.log(`✅ Retrieved ${sales.length} sales records.`, sales);
  
  //     return sales;
  //   } catch (error) {
  //     console.error("❌ Error in getAllSales:", error.message);
  //     throw new Error("Failed to retrieve sales from database");
  //   }
  // }

  async getAllSales(): Promise<TicketOrder[]> {
    try {
      console.log("🟡 Fetching all ticket sales from the database (ticket_system)...");
  
      // 🔥 Garante que as relações estão carregadas corretamente
      const sales = await this.orderRepository.find({
        relations: ['event'],
        order: { id: 'DESC' }, // 🔥 Ordena pelos mais recentes
      });
  
      if (!sales || sales.length === 0) {
        console.warn("⚠️ No sales found in the database.");
        return [];
      }
  
      console.log(`✅ Retrieved ${sales.length} sales records from ticket_system.`, sales);
      return sales;
    } catch (error) {
      console.error("❌ Error fetching sales:", error.message);
      throw new Error("Failed to retrieve sales from database");
    }
  }
  
  
  

  // ✅ Buscar eventos disponíveis
  async getAvailableEvents(): Promise<Event[]> {
    console.log("ivanivan33")
    const events = this.eventRepository.find({ where: { availableTickets: MoreThan(0) } });
    console.log(" eventsivan", JSON.stringify(events));
    return events
  }
}
