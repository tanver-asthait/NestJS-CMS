import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDatabaseStatus() {
    const status = this.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };
    
    return {
      status: states[status] || 'unknown',
      database: this.connection.name,
      host: this.connection.host,
      port: this.connection.port,
    };
  }
}
