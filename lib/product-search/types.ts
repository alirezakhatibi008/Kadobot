
export type ProductSource =
  | "digikala"
  | "basalam"
  | "torob"
  | "digistyle"
  | "golgift"
  | "khanoumi"
  | "taaghche"
  | "snappshop"
  | "janebi"
  | "tapsishop";

export type ProductSearchResult = {
  id: string;
  title: string;
  url: string;
  image: string | null;
  price: number | null;
  currency: "IRR" | "IRT" | null;
  store: ProductSource;
  description: string | null;
  availability: "available" | "unavailable" | "unknown";
  verified: {
    url: boolean;
    price: boolean;
    image: boolean;
    availability: boolean;
  };
  sourceMethod: string;
};

export type ProductSearchResponse = {
  success: boolean;
  query: string;
  products: ProductSearchResult[];
  sources: {
    store: ProductSource;
    method: string;
    success: boolean;
    resultCount: number;
    error?: string;
  }[];
};
