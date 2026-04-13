import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LatencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest<{ method: string; url: string }>();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<{ setHeader: (k: string, v: string) => void }>();
        res.setHeader('X-Response-Time', `${Date.now() - start}ms`);
        console.log(`${req.method} ${req.url} — ${Date.now() - start}ms`);
      }),
    );
  }
}
