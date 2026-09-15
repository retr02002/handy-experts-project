import { prisma } from "@/lib/prisma";
import { formatTicketNumber } from "@/lib/ticketNumber";
import {
  PLATFORM_IDENTITY,
  PLATFORM_BANK,
  PLATFORM_BUSINESS_UNIT,
  DEFAULT_SAC_CODE,
  INVOICE_TERMS,
  type BillerIdentity,
  type BankDetails,
} from "@/lib/companyIdentity";
import { splitGst, type GstSplit } from "./gstSplit";
import { amountInWords } from "./amountInWords";
import { embedPhotos, embedOne, type EmbeddedImage } from "./embedImages";

export type DocumentAudience = "customer" | "vendor";

export interface JobDocumentData {
  audience: DocumentAudience;
  ticketNumber: string;
  generatedAt: Date;
  biller: BillerIdentity;
  bank: BankDetails | null;
  terms: string[];
  businessUnit: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    addressLines: string[];
  };
  technicianName: string | null;
  vendorName: string;
  status: string;
  completionStatus: string | null;
  jobTitle: string;
  scopeOfWork: string;
  times: {
    bookedAt: Date;
    scheduledFor: Date | null;
    startedAt: Date | null;
    completedAt: Date | null;
    totalJobLabel: string;
  };
  photos: { before: EmbeddedImage[]; after: EmbeddedImage[] };
  signature: { image: EmbeddedImage | null; signerName: string | null; signedAt: Date | null };
  invoice: {
    number: string;
    date: Date;
    items: { name: string; sac: string; quantity: number; unit: string; unitPrice: number; amount: number }[];
    subtotal: number;
    gst: GstSplit;
    total: number;
    amountInWords: string;
    paymentMode: string;
    paymentStatus: string | null;
    received: number;
    balance: number;
  };
}

const PAYMENT_MODE_LABELS: Record<string, string> = {
  ONLINE: "Paid Online",
  WALLET: "Paid from Wallet",
  ADMIN: "Admin Created",
  COD: "Cash on Delivery",
};

function durationLabel(start: Date | null, end: Date | null): string {
  if (!start || !end) return "—";
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return "—";
  const totalMinutes = Math.floor(ms / 60000);
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
  const minutes = String(totalMinutes % 60).padStart(2, "0");
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Everything both documents need, in one read. The only difference between
 * the two audiences is whose identity heads the invoice: the platform bills
 * the customer, while the vendor's copy is their own record of the job and
 * carries their own company details.
 */
export async function buildJobDocumentData(
  serviceCallId: string,
  audience: DocumentAudience
): Promise<JobDocumentData | null> {
  const call = await prisma.serviceCall.findUnique({
    where: { id: serviceCallId },
    select: {
      status: true,
      createdAt: true,
      startedAt: true,
      completedAt: true,
      technician: { select: { user: { select: { name: true } } } },
      vendor: {
        select: {
          companyName: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          gstNumber: true,
          panNumber: true,
          user: { select: { phone: true, email: true } },
        },
      },
      report: { select: { remarks: true, completionStatus: true } },
      photos: { select: { phase: true, url: true, storageKey: true, contentType: true }, orderBy: { uploadedAt: "asc" } },
      signature: { select: { url: true, storageKey: true, signerName: true, signedAt: true } },
      liveCall: {
        select: {
          ticketSeq: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          scheduledFor: true,
          createdAt: true,
          subtotal: true,
          tax: true,
          total: true,
          paymentMode: true,
          paymentStatus: true,
          items: { select: { packageName: true, unitPrice: true, quantity: true } },
        },
      },
    },
  });
  if (!call) return null;

  const lc = call.liveCall;
  const ticketNumber = formatTicketNumber(lc.ticketSeq);

  const biller: BillerIdentity =
    audience === "customer"
      ? PLATFORM_IDENTITY
      : {
          name: call.vendor.companyName,
          addressLines: [call.vendor.address],
          city: call.vendor.city,
          state: call.vendor.state,
          // The vendor's own GST state code isn't stored separately; the
          // state name is what's printed, and the split below falls back to
          // comparing state names.
          stateCode: "",
          pincode: call.vendor.pincode,
          phone: call.vendor.user.phone ?? "",
          email: call.vendor.user.email ?? "",
          gstin: call.vendor.gstNumber,
          pan: call.vendor.panNumber,
        };

  const [beforeImages, afterImages, signatureImage] = await Promise.all([
    embedPhotos(call.photos.filter((p) => p.phase === "BEFORE")),
    embedPhotos(call.photos.filter((p) => p.phase === "AFTER")),
    embedOne(call.signature),
  ]);

  const gst = splitGst(lc.tax, biller.state, lc.state);
  const paid = lc.paymentStatus === "PAID";

  return {
    audience,
    ticketNumber,
    generatedAt: new Date(),
    biller,
    // Bank details are the platform's; a vendor's own copy doesn't need
    // them, and we don't hold vendor bank details to print instead.
    bank: audience === "customer" ? PLATFORM_BANK : null,
    terms: INVOICE_TERMS,
    businessUnit: PLATFORM_BUSINESS_UNIT,
    customer: {
      name: lc.customerName,
      phone: lc.customerPhone,
      email: lc.customerEmail,
      addressLines: [lc.address, `${lc.city}, ${lc.state} ${lc.pincode}`],
    },
    technicianName: call.technician?.user.name ?? null,
    vendorName: call.vendor.companyName,
    status: call.status,
    completionStatus: call.report?.completionStatus ?? null,
    jobTitle: lc.items.map((i) => i.packageName).join(", ") || "Service visit",
    scopeOfWork: call.report?.remarks ?? "—",
    times: {
      bookedAt: lc.createdAt,
      scheduledFor: lc.scheduledFor,
      startedAt: call.startedAt,
      completedAt: call.completedAt,
      totalJobLabel: durationLabel(call.startedAt, call.completedAt),
    },
    photos: { before: beforeImages, after: afterImages },
    signature: {
      image: signatureImage,
      signerName: call.signature?.signerName ?? null,
      signedAt: call.signature?.signedAt ?? null,
    },
    invoice: {
      number: ticketNumber,
      date: call.completedAt ?? call.createdAt,
      items: lc.items.map((i) => ({
        name: i.packageName,
        sac: DEFAULT_SAC_CODE,
        quantity: i.quantity,
        unit: "Nos",
        unitPrice: i.unitPrice,
        amount: i.unitPrice * i.quantity,
      })),
      subtotal: lc.subtotal,
      gst,
      total: lc.total,
      amountInWords: amountInWords(lc.total),
      paymentMode: PAYMENT_MODE_LABELS[lc.paymentMode] ?? lc.paymentMode,
      paymentStatus: lc.paymentStatus,
      received: paid ? lc.total : 0,
      balance: paid ? 0 : lc.total,
    },
  };
}
