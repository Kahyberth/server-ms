import { Module } from '@nestjs/common';
import { ChannelsModule } from './channels/channels.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envs } from './common/envs';

@Module({
  imports: [ChannelsModule, TypeOrmModule.forRoot({
    type: 'postgres',
    host: envs.DB_HOST,
    port: envs.DB_PORT,
    username: envs.DB_USERNAME,
    password: envs.DB_PASSWORD,
    database: envs.DB_DATABASE,
    synchronize: true,
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    logger: 'debug'
  })


    ,],
  controllers: [],
  providers: [],
})
export class AppModule { }
