import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
// import { Event } from '../events/event.entity'; // Importa a entidade Event
// import { Sale } from '../sales/sale.entity'; // Importa a entidade Sale

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal')
  price: number;

//   @ManyToOne(() => Event, (event) => event.tickets)
//   event: Event; // Relacionamento com Event
  
//   @OneToMany(() => Sale, (sale) => sale.ticket)
//   sales: Sale[]; // Relacionamento com Sales

  @Column()
  quantity: number;
}
