import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin')
export class AppController {
  constructor(private readonly adminService: AppService) {}

  @Post('create-event')
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({ status: 201, description: 'Event successfully created' })
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.adminService.createEvent(createEventDto);
  }

  @Get('events')
  @ApiOperation({ summary: 'List all events' })
  async getAllEvents() {
    return this.adminService.getAllEvents();
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get event details by ID' })
  async getEvent(@Param('id') id: number) {
    return this.adminService.getEventById(id);
  }

  @Post('create-ticket')
  @ApiOperation({ summary: 'Create a new ticket' })
  async createTicket(@Body() createTicketDto: CreateTicketDto) {
    return this.adminService.createTicket(createTicketDto);
  }

  @Get('tickets')
  @ApiOperation({ summary: 'List all tickets' })
  async getAllTickets() {
    return this.adminService.getAllTickets();
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get ticket details by ID' })
  async getTicket(@Param('id') id: number) {
    return this.adminService.getTicket(id);
  }
}
