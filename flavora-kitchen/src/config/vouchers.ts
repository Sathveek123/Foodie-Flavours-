export interface Voucher {
  code: string;
  type: "percent" | "flat" | "free_shipping";
  value: number;
  description: string;
}

export const VOUCHERS: Voucher[] = [
  {
    code: "FLAVORA50",
    type: "percent",
    value: 50,
    description: "50% off your entire invoice subtotal"
  },
  {
    code: "WELCOME100",
    type: "flat",
    value: 100,
    description: "₹100 flat discount on your first order"
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    description: "100% waiver of delivery fee on this order"
  },
  {
    code: "BDAY2026",
    type: "flat",
    value: 150,
    description: "₹150 flat discount birthday month perk"
  }
];
