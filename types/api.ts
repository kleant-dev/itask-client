// Generic API helpers and DTOs mirroring slender-server

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AccessTokenDto {
  accessToken: string;
  refreshToken: string;
}

