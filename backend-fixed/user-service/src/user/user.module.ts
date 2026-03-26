import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserKafkaController } from './user.kafka.controller';
import { JwtStrategy } from './jwt.strategy';
import { ScopeGuard } from '../common/guards/scope.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'user-service-producer', brokers: [process.env.KAFKA_BROKER] },
          consumer: { groupId: 'user-reply-consumer' },
        },
      },
    ]),
  ],
  controllers: [UserController, UserKafkaController],
  providers: [UserService, JwtStrategy, ScopeGuard],
})
export class UserModule {}
