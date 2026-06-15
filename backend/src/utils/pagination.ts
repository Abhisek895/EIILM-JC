export const parsePagination = (
  pageQuery: unknown,
  limitQuery: unknown
): { page: number; limit: number } => {
  const page = Number.parseInt(String(pageQuery || '1'), 10);
  const limit = Number.parseInt(String(limitQuery || '10'), 10);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit:
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 100) : 10,
  };
};
