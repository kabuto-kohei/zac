export type PageInfo = {
  limit: number;
  cursor: string | null;
  hasNext: boolean;
};

export function dataResponse<T>(data: T) {
  return { data };
}

export function paginatedResponse<T>(data: T[], page: PageInfo = defaultPageInfo()) {
  return {
    data,
    page,
  };
}

export function notFoundResponse() {
  return {
    error: {
      code: "not_found",
      message: "Not found.",
      details: {},
    },
  };
}

export function validationErrorResponse(details: unknown) {
  return {
    error: {
      code: "validation_error",
      message: "Invalid request.",
      details,
    },
  };
}

function defaultPageInfo(): PageInfo {
  return {
    limit: 20,
    cursor: null,
    hasNext: false,
  };
}
