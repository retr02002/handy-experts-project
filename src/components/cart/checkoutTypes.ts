export type CheckoutStep = "cart" | "details" | "slot" | "payment" | "success";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  // Optional alternate contact for the site, in case the technician should
  // call someone other than the customer on arrival. Empty string means
  // "same as the customer" — never sent to the server as "".
  siteContactName: string;
  siteContactPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  // Captured from "use current location" — null if the customer typed their
  // address manually instead. Used to find nearby vendors for the live call;
  // if null at order time, the server falls back to geocoding the typed
  // address rather than blocking checkout outright.
  latitude: number | null;
  longitude: number | null;
  // Neighbourhood/suburb text carried from the picked/current-location
  // address — used server-side only to derive the order's structured-ID
  // area code (see LiveCall.locality); null for a manually-typed address.
  locality: string | null;
}

export const EMPTY_CUSTOMER_DETAILS: CustomerDetails = {
  name: "",
  email: "",
  phone: "",
  siteContactName: "",
  siteContactPhone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: null,
  longitude: null,
  locality: null,
};

export type PaymentMethod = "ONLINE" | "COD";

export interface PaymentDetails {
  method: PaymentMethod | "";
}

export const EMPTY_PAYMENT_DETAILS: PaymentDetails = {
  method: "",
};

export interface SlotDetails {
  isInstant: boolean;
  // ISO string, ignored when isInstant is true.
  scheduledFor: string | null;
}

export const EMPTY_SLOT_DETAILS: SlotDetails = {
  isInstant: true,
  scheduledFor: null,
};

export function isSlotComplete(slot: SlotDetails): boolean {
  return slot.isInstant || slot.scheduledFor !== null;
}

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "ONLINE",
    label: "Pay Online",
    description: "UPI, cards, netbanking & wallets — pay securely now",
    icon: "ph:lightning-bold",
  },
  {
    value: "COD",
    label: "Cash on Delivery",
    description: "Pay the technician in cash once the job is done",
    icon: "ph:hand-coins-bold",
  },
];

export function isDetailsComplete(details: CustomerDetails): boolean {
  return (
    details.name.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(details.email.trim()) &&
    /^\d{10}$/.test(details.phone.trim()) &&
    (details.siteContactPhone.trim() === "" || /^\d{10}$/.test(details.siteContactPhone.trim())) &&
    details.address.trim().length > 5 &&
    details.city.trim().length > 1 &&
    details.state.trim().length > 1 &&
    /^\d{6}$/.test(details.pincode.trim())
  );
}

export function isPaymentComplete(payment: PaymentDetails): boolean {
  return payment.method !== "";
}
