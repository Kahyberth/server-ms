import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Server } from "./server.entity";
import { Message } from "./message.entity";

@Entity('Channel')
export class Channel {
    @PrimaryGeneratedColumn('uuid')
    channel_id: string;

    @Column({ type: 'varchar', nullable: false })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', nullable: false })
    created_by: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;


    @ManyToOne(() => Channel, (channel) => channel.subchannel, {
        nullable: true,
        onDelete: 'CASCADE'
    })
    @JoinColumn({ name: 'parentId' })
    parent?: Channel;


    @OneToMany(() => Channel, (channel) => channel.parent)
    subchannel: Channel[];

    @ManyToOne(()=> Server,(server)=> server.channel)
    server: Server;

    @OneToMany(()=> Message, (message)=> message.channel)
    message: Message[];
}
