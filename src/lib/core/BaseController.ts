import { Body, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { PaginateQueryDto } from 'src/lib/pagination/dto/paginate-query.dto';
import { Paginate } from 'src/lib/pagination/paginate';
import { BaseService } from './BaseService';

export abstract class BaseController<
  T,
  CreateDto extends Partial<T>,
  UpdateDto extends Partial<T>,
> {
  constructor(protected readonly service: BaseService<T>) {}

  @Post()
  @ApiOperation({ summary: 'Create new record' })
  @ApiResponse({
    status: 201,
    description: 'Record has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  async create(@Body() createDto: CreateDto) {
    const data = await this.service.create(createDto);
    return {
      data,
      message: 'Record created successfully',
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all records' })
  @ApiResponse({
    status: 200,
    description: 'Return all records.',
  })
  async getAll(@Query() query: PaginateQueryDto) {
    const paginate = new Paginate<Partial<T>>(query);
    const [data, count] = await this.service.all(paginate.params());
    return paginate.response(data as Partial<T>[], count);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get record by id' })
  @ApiResponse({
    status: 200,
    description: 'Return the record.',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not found',
    type: ErrorResponseDto,
  })
  async getOne(@Param('id') id: string) {
    const data = await this.service.one(id);
    return {
      data,
      message: 'Record fetched successfully',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update record by id' })
  @ApiResponse({
    status: 200,
    description: 'Record has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Record not found',
    type: ErrorResponseDto,
  })
  async update(@Param('id') id: string, @Body() updateDto: UpdateDto) {
    const data = await this.service.update(id, updateDto);
    return {
      data,
      message: 'Record updated successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete record' })
  @ApiResponse({
    status: 200,
    description: 'Record has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'Record not found',
    type: ErrorResponseDto,
  })
  async delete(@Param('id') id: string) {
    const data = await this.service.remove(id);
    return {
      data,
      message: 'Record deleted successfully',
    };
  }
}
