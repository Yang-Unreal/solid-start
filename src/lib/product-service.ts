import db from "~/db/index";
import { product as productTable } from "~/db/schema";
import { asc, desc, count, Column } from "drizzle-orm";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

export interface Product {
  id: string;
  name: string;
  description: string | null;
  priceInCents: number;
  imageUrl: string | null;
  category: string | null;
  stockQuantity: number;
  createdAt: string; // Expects a string
  updatedAt: string; // Expects a string
}

export interface ApiResponse {
  data: Product[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalProducts: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getProducts(options: {
  page: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<ApiResponse> {
  const {
    page,
    sortBy: sortByInput = "createdAt",
    sortOrder = "desc",
  } = options;
  let { pageSize = DEFAULT_PAGE_SIZE } = options;

  pageSize = Math.min(pageSize, MAX_PAGE_SIZE);
  const offset = (page - 1) * pageSize;

  const columns = productTable as unknown as Record<string, Column>;
  const validSortKeys = Object.keys(columns);
  const finalSortBy = validSortKeys.includes(sortByInput)
    ? sortByInput
    : "createdAt";
  const sortColumn = columns[finalSortBy];

  if (!sortColumn) {
    throw new Error("Server configuration error: Invalid sort key.");
  }

  const [productsFromDb, totalCountResult] = await Promise.all([
    db
      .select()
      .from(productTable)
      .orderBy(sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn))
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(productTable),
  ]);

  const totalProducts = totalCountResult[0]?.total ?? 0;
  const totalPages = Math.ceil(totalProducts / pageSize);

  // --- THIS IS THE FIX ---
  // Manually convert Date objects to ISO strings to match the 'Product' interface.
  // This guarantees the data shape is consistent.
  const productsData: Product[] = productsFromDb.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));

  return {
    data: productsData,
    pagination: {
      currentPage: page,
      pageSize,
      totalProducts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
