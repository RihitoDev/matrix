import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { ResponseInterceptor } from '../../../common/interceptors/index.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { UserSearchService } from '../services/user-search.service.js';
import {
  searchUsersSchema,
  type SearchUsersDto,
} from '../requests/search-users.schema.js';
import type { ChatUserResponse } from '../responses/chat-user.response.js';

@Controller('chat/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('titulado', 'estudiante', 'mentor', 'empresa')
@UseInterceptors(ResponseInterceptor)
export class UserSearchController {
  constructor(private readonly userSearchService: UserSearchService) {}

  @Get('search')
  search(
    @Query(new ZodValidationPipe(searchUsersSchema)) query: SearchUsersDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ChatUserResponse[]> {
    return this.userSearchService.search(query.q, user.id);
  }
}