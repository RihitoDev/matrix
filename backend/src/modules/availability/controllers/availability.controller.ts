import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { Roles } from '../../../common/decorators/roles.decorator.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { ProvisionalSessionGuard } from '../../../common/guards/provisional.guard.js';
import { RolesGuard } from '../../../common/guards/roles.guard.js';
import {
  CREATE_BLOCK_DOCS,
  DELETE_BLOCK_DOCS,
  FIND_MY_BLOCKS_DOCS,
  UPDATE_BLOCK_DOCS,
} from '../constants/availability-docs.constants.js';
import { CreateBlockDto } from '../requests/create-block.request.js';
import { WeekQueryDto } from '../requests/week-query.request.js';
import { blockIdSchema } from '../requests/block-id.request.js';
import { UpdateBlockDto } from '../requests/update-block.request.js';
import { AvailabilityService } from '../services/availability.service.js';
import type { AvailabilityBlockResponse } from '../types/availability-block-response.types.js';
import type { DeletedBlockResponse } from '../types/deleted-block-response.types.js';

@Controller('availability-blocks')
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(ProvisionalSessionGuard, RolesGuard)
  @Roles('mentor')
  @ApiOperation({ summary: CREATE_BLOCK_DOCS.summary })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateBlockDto,
  ): Promise<AvailabilityBlockResponse> {
    return this.availabilityService.create(user.id, body);
  }

  @Get()
  @UseGuards(ProvisionalSessionGuard, RolesGuard)
  @Roles('mentor')
  @ApiOperation({ summary: FIND_MY_BLOCKS_DOCS.summary })
  @ApiQuery({ name: 'from', description: FIND_MY_BLOCKS_DOCS.fromDescription })
  @ApiQuery({ name: 'to', description: FIND_MY_BLOCKS_DOCS.toDescription })
  findMyBlocks(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WeekQueryDto,
  ): Promise<AvailabilityBlockResponse[]> {
    return this.availabilityService.findMyBlocks(user.id, query);
  }

  @Patch(':id')
  @UseGuards(ProvisionalSessionGuard, RolesGuard)
  @Roles('mentor')
  @ApiOperation({ summary: UPDATE_BLOCK_DOCS.summary })
  @ApiParam({ name: 'id', description: UPDATE_BLOCK_DOCS.idDescription })
  updateBlock(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(blockIdSchema)) id: string,
    @Body() body: UpdateBlockDto,
  ): Promise<AvailabilityBlockResponse> {
    return this.availabilityService.updateBlock(user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(ProvisionalSessionGuard, RolesGuard)
  @Roles('mentor')
  @ApiOperation({ summary: DELETE_BLOCK_DOCS.summary, description: DELETE_BLOCK_DOCS.description })
  @ApiParam({ name: 'id', description: DELETE_BLOCK_DOCS.idDescription })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ZodValidationPipe(blockIdSchema)) id: string,
  ): Promise<DeletedBlockResponse> {
    return this.availabilityService.remove(user.id, id);
  }
}
