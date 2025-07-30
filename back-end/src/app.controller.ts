import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('chat')
  async chat(@Body() body: { message: string }, @Res() res: Response) {
    try {
      // Simple echo response for now
      // You can extend this with actual chat logic, AI integration, etc.
      const response = {
        response: `You said: "${body.message}". This is a simple echo response from the NestJS backend!`,
        timestamp: new Date().toISOString(),
      };

      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
