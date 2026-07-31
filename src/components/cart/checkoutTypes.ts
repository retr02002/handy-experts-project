export type CheckoutStep = "cart" | "details" | "payment" | "success";

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export const EMPTY_CUSTOMER_DETAILS: CustomerDetails = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export type PaymentMode = "gpay" | "phonepe" | "paytm" | "amazonpay" | "bhim" | "other-upi";

export interface PaymentDetails {
  mode: PaymentMode | "";
  upiRef: string;
  screenshotFile: File | null;
  screenshotPreview: string | null;
}

export const EMPTY_PAYMENT_DETAILS: PaymentDetails = {
  mode: "",
  upiRef: "",
  screenshotFile: null,
  screenshotPreview: null,
};

export const PAYMENT_MODE_OPTIONS: { value: PaymentMode; label: string; color: string }[] = [
  { value: "gpay", label: "Google Pay", color: "bg-blue-500" },
  { value: "phonepe", label: "PhonePe", color: "bg-violet-600" },
  { value: "paytm", label: "Paytm", color: "bg-sky-600" },
  { value: "amazonpay", label: "Amazon Pay", color: "bg-orange-500" },
  { value: "bhim", label: "BHIM UPI", color: "bg-emerald-600" },
  { value: "other-upi", label: "Other UPI App", color: "bg-slate-500" },
];

export function isDetailsComplete(details: CustomerDetails): boolean {
  return (
    details.name.trim().length > 1 &&
    /^\S+@\S+\.\S+$/.test(details.email.trim()) &&
    /^\d{10}$/.test(details.phone.trim()) &&
    details.address.trim().length > 5 &&
    details.city.trim().length > 1 &&
    details.state.trim().length > 1 &&
    /^\d{6}$/.test(details.pincode.trim())
  );
}

export function isPaymentComplete(payment: PaymentDetails): boolean {
  return (
    payment.mode !== "" &&
    payment.upiRef.trim().length > 3 &&
    payment.screenshotFile !== null
  );
}
