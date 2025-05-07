import { Controller, Get, Res } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Controller()
export class AdminApiSetupNotFoundController {
  @Get('/restart')
  restart(@Res() res: FastifyReply) {
    res.send('✅ Restarting...');
    process.exit(1);
  }
}
