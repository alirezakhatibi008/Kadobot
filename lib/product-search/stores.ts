
import type { ProductSource } from "./types";

export type StoreConfig = {
  id: ProductSource;
  name: string;
  domain: string;
  enabled: boolean;
};

export const STORES: StoreConfig[] = [
  {
    id: "digikala",
    name: "دیجی‌کالا",
    domain: "digikala.com",
    enabled: true,
  },
  {
    id: "basalam",
    name: "باسلام",
    domain: "basalam.com",
    enabled: true,
  },
  {
    id: "torob",
    name: "ترب",
    domain: "torob.com",
    enabled: true,
  },
  {
    id: "digistyle",
    name: "دیجی‌استایل",
    domain: "digistyle.com",
    enabled: true,
  },
  {
    id: "golgift",
    name: "گل‌گیفت",
    domain: "gol.gift",
    enabled: true,
  },
  {
    id: "khanoumi",
    name: "خانومی",
    domain: "khanoumi.com",
    enabled: true,
  },
  {
    id: "taaghche",
    name: "طاقچه",
    domain: "taaghche.com",
    enabled: true,
  },
  {
    id: "snappshop",
    name: "اسنپ‌شاپ",
    domain: "shop.snapp.ir",
    enabled: true,
  },
  {
    id: "janebi",
    name: "جانبی",
    domain: "janebi.com",
    enabled: true,
  },
  {
    id: "tapsishop",
    name: "تپسی‌شاپ",
    domain: "tapsi.shop",
    enabled: true,
  },
];

export const ACTIVE_STORES = STORES.filter(
  (store) => store.enabled
);
