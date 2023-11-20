import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateHostDto } from 'src/dto';
import { adminGuard, webhookGuard } from 'src/guards';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hosts')
  getHosts(@Headers() headers: Record<string, string>) {
    adminGuard({ headers });
    return this.appService.getHosts();
  }

  @Delete('hosts/:id')
  removeHost(
    @Param('id', ParseIntPipe) id: number,
    @Headers() headers: Record<string, string>,
  ) {
    adminGuard({ headers });
    return this.appService.removeHost(id);
  }

  @Post('hosts')
  createHost(
    @Body() body: CreateHostDto,
    @Headers() headers: Record<string, string>,
  ) {
    adminGuard({ headers });
    return this.appService.addHost(body);
  }

  @Post('webhook')
  webhook(
    @Body() body: Record<string, string>,
    @Headers() headers: Record<string, string>,
  ) {
    const canBeHandled = webhookGuard({ headers });

    if (!canBeHandled) return 200;

    return this.appService.webhook(body, headers);
  }
}
