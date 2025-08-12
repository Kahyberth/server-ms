
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MathController {
  @MessagePattern('channel.ping')
  accumulate(data: number[]): number {
    return (data || []).reduce((a, b) => a + b);
  }
}
