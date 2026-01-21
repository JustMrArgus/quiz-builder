import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    const date = new Date().toISOString().slice(0, 10);
    return { status: 'success', date };
  }
}
