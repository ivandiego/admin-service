import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { Ticket } from './ticket.entity';
import { TicketOrder } from './order-ticket.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid') // 🔥 Agora usa UUID para consistência
  id: string;

  @Column()
  name: string;

  @Column()
  @Index() // ✅ Índice para melhorar performance ao buscar eventos com ingressos disponíveis
  availableTickets: number;

  @OneToMany(() => Ticket, (ticket) => ticket.event) // 🔥 Relacionamento reverso com Ticket
  tickets: Ticket[];

  @Column({ default: 0, nullable: false }) // 🔥 Corrigido: não pode ser NULL
  soldTickets: number;

  @Column({ default: 0, nullable: false }) // 🔥 Corrigido: não pode ser NULL
  totalTickets: number;

  @OneToMany(() => TicketOrder, (order) => order.event) // 🔥 Adicionando relação reversa
  ticketOrders: TicketOrder[];

}
