import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly VALID_API_KEY: string;

  constructor(private readonly configService: ConfigService) {
    this.VALID_API_KEY =
      this.configService.getOrThrow<string>('CAMERA_WEBHOOK_KEY');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (apiKey !== this.VALID_API_KEY) {
      throw new UnauthorizedException('API Key inválida o ausente');
    }
    return true;
  }
}
