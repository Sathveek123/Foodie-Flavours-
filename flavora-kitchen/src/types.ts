export type Category = {
  id: string;
  name: string;
  count: number;
  icon: string;
};

export type Dish = {
  id: string;
  name: string;
  price: number;
  image: string; // URL or color for placeholder
  badge?: string;
  description?: string;
};
