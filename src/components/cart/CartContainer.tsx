"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { createLiveCallAction } from "@/actions/livecall.actions";
import { createRazorpayOrderAction, verifyRazorpayPaymentAction } from "@/actions/payment.actions";
import { getMyCustomerWalletBalanceAction } from "@/actions/wallet.actions";
import { computeOrderTotal } from "@/lib/pricing";
import { openRazorpayCheckout, type RazorpaySuccessResponse } from "@/lib/loadRazorpayCheckout";
import { CartItemCard } from "./CartItemCard";
import { OrderSummaryPanel } from "./OrderSummaryPanel";
import { DiscountCodeForm } from "./DiscountCodeForm";
import { EmptyCart } from "./EmptyCart";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CheckoutStepper } from "./CheckoutStepper";
import { DetailsStep } from "./steps/DetailsStep";
import { SlotStep } from "./steps/SlotStep";
import { PaymentStep } from "./steps/PaymentStep";
import { OrderSuccess } from "./steps/OrderSuccess";
import {
  type CheckoutStep,
  type CustomerDetails,
  type PaymentDetails,
  type SlotDetails,
  EMPTY_CUSTOMER_DETAILS,
  EMPTY_PAYMENT_DETAILS,
  EMPTY_SLOT_DETAILS,
  isDetailsComplete,
  isPaymentComplete,
  isSlotComplete,
} from "./checkoutTypes";

type Tab = "active" | "saved";

export function CartContainer() {
  const { items, savedItems, totalPrice, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("active");

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>(EMPTY_CUSTOMER_DETAILS);
  const [slotDetails, setSlotDetails] = useState<SlotDetails>(EMPTY_SLOT_DETAILS);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(EMPTY_PAYMENT_DETAILS);
  const [orderId, setOrderId] = useState("");
  const [finalPaymentMethod, setFinalPaymentMethod] = useState<"ONLINE" | "COD" | "WALLET">("COD");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getMyCustomerWalletBalanceAction().then((res) => {
      if (res.success && res.data) setWalletBalance(res.data.balance);
    });
  }, []);

  if (!mounted) {
    return <div className="animate-pulse h-[60vh] bg-slate-100/50 dark:bg-slate-800/20 rounded-2xl"></div>;
  }

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const { total: grandTotal } = computeOrderTotal(Math.max(0, totalPrice - discountAmount));
  const walletApplied = useWallet ? Math.min(walletBalance, grandTotal) : 0;
  const amountDue = grandTotal - walletApplied;

  const goToDetails = () => setCheckoutStep("details");

  const goToSlot = () => {
    if (!isDetailsComplete(customerDetails)) {
      toast.error("Please fill in your name, a valid email, 10-digit phone, address and 6-digit pincode.");
      return;
    }
    setCheckoutStep("slot");
  };

  const goToPayment = () => {
    if (!isSlotComplete(slotDetails)) {
      toast.error("Please pick a day and time, or choose Instant.");
      return;
    }
    setCheckoutStep("payment");
  };

  const checkoutPayload = {
    customerName: customerDetails.name,
    customerEmail: customerDetails.email,
    customerPhone: customerDetails.phone,
    siteContactName: customerDetails.siteContactName.trim() || undefined,
    siteContactPhone: customerDetails.siteContactPhone.trim() || undefined,
    address: customerDetails.address,
    city: customerDetails.city,
    state: customerDetails.state,
    pincode: customerDetails.pincode,
    latitude: customerDetails.latitude,
    longitude: customerDetails.longitude,
    scheduledFor: slotDetails.isInstant ? null : slotDetails.scheduledFor,
    walletAmountRequested: walletApplied,
    couponCode: appliedCoupon?.code,
  };

  const placeCodOrder = async () => {
    const res = await createLiveCallAction(checkoutPayload);
    if (!res.success) {
      toast.error(res.error || "Failed to place your order. Please try again.");
      return;
    }
    if (!res.data) {
      toast.error("Failed to place your order. Please try again.");
      return;
    }
    setOrderId(res.data.liveCallId);
    setFinalPaymentMethod(amountDue === 0 ? "WALLET" : "COD");
    clearCart();
    setCheckoutStep("success");
  };

  const placeOnlineOrder = async () => {
    const res = await createRazorpayOrderAction(checkoutPayload);
    if (!res.success) {
      toast.error(res.error || "Couldn't start the payment. Please try again.");
      setIsPlacingOrder(false);
      return;
    }
    if (!res.data) {
      toast.error("Couldn't start the payment. Please try again.");
      setIsPlacingOrder(false);
      return;
    }
    const { liveCallId, fullyCoveredByWallet, razorpayOrderId, amountPaise, currency, keyId } = res.data;

    if (fullyCoveredByWallet || !razorpayOrderId || !keyId) {
      // Wallet balance covered the whole order — no Razorpay step needed.
      setOrderId(liveCallId);
      setFinalPaymentMethod("WALLET");
      clearCart();
      setCheckoutStep("success");
      setIsPlacingOrder(false);
      return;
    }

    try {
      await openRazorpayCheckout({
        key: keyId,
        amount: amountPaise,
        currency,
        order_id: razorpayOrderId,
        name: "Handyzo",
        description: "Service booking payment",
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        theme: { color: "#00B4FF" },
        handler: async (response: RazorpaySuccessResponse) => {
          const verifyRes = await verifyRazorpayPaymentAction({
            liveCallId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          if (!verifyRes.success) {
            toast.error(verifyRes.error || "We couldn't confirm your payment. Please contact support.");
            setIsPlacingOrder(false);
            return;
          }
          setOrderId(liveCallId);
          setFinalPaymentMethod("ONLINE");
          clearCart();
          setCheckoutStep("success");
          setIsPlacingOrder(false);
        },
        modal: {
          // Abandoned/cancelled — the AWAITING_PAYMENT row just expires via
          // the existing sweep, no cleanup call needed here.
          ondismiss: () => setIsPlacingOrder(false),
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't open the payment gateway. Please try again.");
      setIsPlacingOrder(false);
    }
  };

  const placeOrder = async () => {
    if (!isDetailsComplete(customerDetails)) {
      toast.error("Please go back and complete your details first.");
      return;
    }
    // When the wallet fully covers the order there's no payment method to
    // pick — both createLiveCallAction and createRazorpayOrderAction treat a
    // zero remainder identically (an immediate WALLET-paid order), so it
    // doesn't matter which branch runs below.
    if (amountDue > 0 && !isPaymentComplete(paymentDetails)) {
      toast.error("Please choose how you'd like to pay.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      if (amountDue === 0 || paymentDetails.method === "COD") {
        await placeCodOrder();
        setIsPlacingOrder(false);
      } else {
        // Online path resets isPlacingOrder itself once the Razorpay modal
        // resolves (handler/ondismiss) — it stays true while the modal is open.
        await placeOnlineOrder();
      }
    } catch {
      setIsPlacingOrder(false);
    }
  };

  if (checkoutStep === "success") {
    return <OrderSuccess orderId={orderId} paymentMethod={finalPaymentMethod} />;
  }

  const displayItems = activeTab === "active" ? items : savedItems;
  const isDisplayEmpty = displayItems.length === 0;

  return (
    <div className="flex flex-col gap-6 pb-36 lg:pb-0">
      {/* Step Indicator */}
      <div className="overflow-x-auto pb-1">
        <CheckoutStepper current={checkoutStep} />
      </div>

      {checkoutStep === "cart" && (
        <>
          {/* Sleek Segmented Control Tabs */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1 p-1 bg-slate-100 dark:bg-[#0B1221] rounded-lg w-full sm:w-fit border border-slate-200 dark:border-slate-800/80">
            <button
              onClick={() => setActiveTab("active")}
              className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "active"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              <ClientIcon icon="ph:shopping-cart" className="w-4 h-4 shrink-0" />
              <span className="truncate">Active Cart</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                {items.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-colors ${
                activeTab === "saved"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              <ClientIcon icon="ph:bookmark-simple" className="w-4 h-4 shrink-0" />
              <span className="truncate">Saved Items</span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                {savedItems.length}
              </span>
            </button>
          </div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left Column: Items List */}
            <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
              {/* Discount code lives inline here on mobile — the desktop sidebar has its own copy */}
              {activeTab === "active" && !isDisplayEmpty && (
                <div className="lg:hidden bg-white dark:bg-[#0B1221] p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                  <DiscountCodeForm />
                </div>
              )}
              {isDisplayEmpty ? (
                <EmptyCart isSavedTab={activeTab === "saved"} />
              ) : (
                <div className="flex flex-col gap-4">
                  {displayItems.map((item) => (
                    <CartItemCard key={item.id} item={item} isSavedItem={activeTab === "saved"} />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Summary */}
            {activeTab === "active" && !isDisplayEmpty && (
              <OrderSummaryPanel
                showDiscount
                primaryLabel="Continue to Details"
                onPrimary={goToDetails}
                appliedCoupon={appliedCoupon}
                onCouponApplied={setAppliedCoupon}
                onCouponRemoved={() => setAppliedCoupon(null)}
              />
            )}
          </div>
        </>
      )}

      {checkoutStep === "details" && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full min-w-0">
            <DetailsStep details={customerDetails} onChange={setCustomerDetails} />
          </div>
          <OrderSummaryPanel
            primaryLabel="Continue to Slot"
            onPrimary={goToSlot}
            onBack={() => setCheckoutStep("cart")}
            backLabel="Back to Cart"
            appliedCoupon={appliedCoupon}
          />
        </div>
      )}

      {checkoutStep === "slot" && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full min-w-0">
            <SlotStep
              details={customerDetails}
              slot={slotDetails}
              onChange={setSlotDetails}
              onChangeAddress={() => setCheckoutStep("details")}
            />
          </div>
          <OrderSummaryPanel
            primaryLabel="Continue to Payment"
            onPrimary={goToPayment}
            onBack={() => setCheckoutStep("details")}
            backLabel="Back to Details"
            appliedCoupon={appliedCoupon}
          />
        </div>
      )}

      {checkoutStep === "payment" && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="flex-1 w-full min-w-0">
            <PaymentStep
              payment={paymentDetails}
              onChange={setPaymentDetails}
              orderTotal={grandTotal}
              amountDue={amountDue}
              walletBalance={walletBalance}
              useWallet={useWallet}
              onToggleWallet={setUseWallet}
            />
          </div>
          <OrderSummaryPanel
            primaryLabel={isPlacingOrder ? "Placing Order..." : "Place Order"}
            primaryIcon={isPlacingOrder ? "svg-spinners:180-ring" : "ph:check-circle-bold"}
            onPrimary={placeOrder}
            primaryDisabled={isPlacingOrder}
            onBack={() => setCheckoutStep("slot")}
            backLabel="Back to Slot"
            appliedCoupon={appliedCoupon}
          />
        </div>
      )}
    </div>
  );
}
