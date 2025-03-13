import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketOrder } from './entities/order-ticket.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // // ✅ Criar evento (Kafka)
  // @MessagePattern('create_event')
  // async handleCreateEvent(data: { userId: string; eventId: string;}) {
  //   console.log(" create_event3")
  //   const event = await this.appService.createEvent(data);
  //   return JSON.parse(JSON.stringify(event));
  // }

  @MessagePattern('create_event')
  async handleCreateEvent(data: { 
    userId: string; 
    name: string; 
  }) {
    try {
      console.log("🟢 Received create_event request:", JSON.stringify(data));
  
      // 🔹 Definir availableTickets e totalTickets como 0 por padrão
      const eventData = {
        ...data,
        availableTickets: 0,
        totalTickets: 0
      };
  
      // 🔥 Criar o evento corretamente com todas as propriedades necessárias
      const event = await this.appService.createEvent(eventData);
  
      console.log("✅ Event successfully created:", JSON.stringify(event));
  
      return { success: true, data: event };
    } catch (error) {
      console.error("❌ Error in create_event:", error.message);
      return { success: false, message: error.message };
    }
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

  @MessagePattern('create_ticket')
  async handleCreateTicket(dto: CreateTicketDto) {
    try {
      console.log("🟢 Creating tickets for event:", dto.eventId);
      
      const ticket = await this.appService.createAvailableTickets(dto);
      
      return { success: true, data: ticket };
    } catch (error) {
      console.error("❌ Error in create_ticket:", error.message);
      return { success: false, message: error.message };
    }
  }
  

  @MessagePattern('buy_ticket')
  async handlBuyTicket(dto: CreateTicketDto) {
    try {
      console.log("Processing ticket purchase...");
      const ticket = await this.appService.createTicket(dto);
      return { success: true, data: ticket };
    } catch (error) {
      console.error("Error in buy_ticket:", error.message);
      return { success: false, message: error.message };
    }
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

  @MessagePattern('get_all_sales') 
async handleGetAllSales() {
  try {
    console.log("🟡 Handling get_all_sales request...");

    const sales = await this.appService.getAllSales();

    console.log(`✅ Retrieved ${sales.length} sales records.`);

    return { success: true, data: sales };
  } catch (error) {
    console.error("❌ Error in handleGetAllSales:", error.message);
    return { success: false, message: "Failed to fetch sales", error: error.message };
  }
}

    

    // ✅ Buscar eventos disponíveis (Kafka)
    @MessagePattern('get_available_events')
    async handleGetAvailableEvents() {
      console.log("ivanivan")
      return await this.appService.getAvailableEvents();
    }
}
