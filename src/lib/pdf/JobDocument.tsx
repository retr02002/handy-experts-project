/* eslint-disable jsx-a11y/alt-text --
   <Image> here is @react-pdf/renderer's PDF primitive, not an HTML <img>.
   The PDF image operator has no alt attribute, so the rule is matching on
   the component name alone and there is nothing meaningful to add. */
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { HANDYZO_LOGO_DATA_URI } from "./logoBase64";
import type { JobDocumentData } from "./documentData";

/**
 * Server-rendered react-pdf tree. Deliberately NOT a "use client" module —
 * @react-pdf/renderer must never reach a browser bundle, so nothing with
 * "use client" may import this file. Only the document route does.
 */

const C = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#cbd5e1",
  faint: "#f1f5f9",
  accent: "#00B4FF",
};

const s = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 36, paddingHorizontal: 28, fontSize: 9, color: C.ink, fontFamily: "Helvetica" },

  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 },
  headerTitle: { fontSize: 12, fontFamily: "Helvetica-Bold" },
  headerMeta: { fontSize: 9, color: C.ink },
  rule: { borderBottomWidth: 1.5, borderBottomColor: C.ink, marginBottom: 14 },

  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 6 },
  label: { fontSize: 7.5, color: C.muted, marginBottom: 2 },
  value: { fontSize: 9 },

  twoCol: { flexDirection: "row", gap: 24, marginBottom: 18 },
  col: { flex: 1 },

  grid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  gridCell: { width: "33.33%", marginBottom: 12, paddingRight: 8 },

  block: { marginBottom: 16 },

  // Invoice table
  table: { borderWidth: 1, borderColor: C.line },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line },
  trLast: { flexDirection: "row" },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", padding: 4, borderRightWidth: 1, borderRightColor: C.line },
  td: { fontSize: 8, padding: 4, borderRightWidth: 1, borderRightColor: C.line },
  headRow: { backgroundColor: C.faint },

  billerName: { fontSize: 13, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  billerLine: { fontSize: 7.5, color: C.ink, marginBottom: 1 },

  boxRow: { flexDirection: "row", borderWidth: 1, borderColor: C.line, borderBottomWidth: 0 },
  boxCell: { flex: 1, padding: 5, borderRightWidth: 1, borderRightColor: C.line },

  amountRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  bold: { fontFamily: "Helvetica-Bold" },

  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  photo: { width: 150, height: 150, objectFit: "cover", borderWidth: 1, borderColor: C.line },

  footerNote: { position: "absolute", bottom: 18, left: 28, right: 28, fontSize: 7, color: C.muted, textAlign: "center" },
});

const money = (n: number) => `Rs. ${n.toFixed(2)}`;
const dt = (d: Date | null) =>
  d
    ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
const dOnly = (d: Date) => d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

function DocHeader({ title, right }: { title: string; right: string }) {
  return (
    <>
      <View style={s.headerRow}>
        <Text style={s.headerTitle}>{title}</Text>
        <Text style={s.headerMeta}>{right}</Text>
      </View>
      <View style={s.rule} />
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.gridCell}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function JobDocument({ data }: { data: JobDocumentData }) {
  const { invoice, biller, customer, photos, signature, times } = data;
  const hasPhotos = photos.before.length > 0 || photos.after.length > 0;

  return (
    <Document
      title={`${data.ticketNumber} — Job Report & Invoice`}
      author={biller.name}
      subject={`Job report and invoice for ${data.ticketNumber}`}
    >
      {/* ── Page 1: Job Report ───────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <DocHeader title={`Job Report — ${data.ticketNumber}`} right={dt(times.completedAt ?? times.bookedAt)} />

        <View style={s.twoCol}>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Contact Information</Text>
            <Text style={{ ...s.value, color: C.accent, marginBottom: 2 }}>{customer.name}</Text>
            <Text style={s.value}>Phone: {customer.phone}</Text>
            <Text style={s.value}>Technician: {data.technicianName ?? "—"}</Text>
            <Text style={s.value}>Status: {data.completionStatus ?? data.status}</Text>
          </View>
          <View style={s.col}>
            <Text style={s.sectionTitle}>Location</Text>
            {customer.addressLines.map((line, i) => (
              <Text key={i} style={s.value}>
                {line}
              </Text>
            ))}
          </View>
        </View>

        <Text style={s.sectionTitle}>Job Details</Text>
        <View style={s.grid}>
          <Field label="Job Number" value={data.ticketNumber} />
          <Field label="Business Unit" value={data.businessUnit} />
          <Field label="Service Provider" value={data.vendorName} />
          <Field label="Booked Time" value={dt(times.bookedAt)} />
          <Field label="Scheduled Time" value={times.scheduledFor ? dt(times.scheduledFor) : "Instant"} />
          <Field label="No. Of Crew" value="1" />
          <Field label="Job Started Time" value={dt(times.startedAt)} />
          <Field label="Job Completed Time" value={dt(times.completedAt)} />
          <Field label="Total Job Time" value={times.totalJobLabel} />
        </View>

        <View style={s.block}>
          <Text style={s.sectionTitle}>Job Title</Text>
          <Text style={s.value}>{data.jobTitle}</Text>
        </View>

        <View style={s.block}>
          <Text style={s.sectionTitle}>Scope of the Work</Text>
          <Text style={s.value}>{data.scopeOfWork}</Text>
        </View>

        {/* Acknowledgement: a drawn signature when one was captured,
            otherwise an honest statement of what actually was verified —
            never a blank signature line implying consent we didn't collect. */}
        <View style={{ marginTop: 24, alignItems: "flex-end" }}>
          <Text style={{ ...s.sectionTitle, marginBottom: 4 }}>Acknowledged By</Text>
          {signature.image ? (
            <>
              <Image src={signature.image.dataUri} style={{ width: 120, height: 50, objectFit: "contain" }} />
              <Text style={s.value}>{signature.signerName}</Text>
              <Text style={{ ...s.label, marginTop: 2 }}>{dt(signature.signedAt)}</Text>
            </>
          ) : (
            <View style={{ alignItems: "flex-end" }}>
              <Text style={s.value}>{customer.name}</Text>
              <Text style={{ ...s.label, marginTop: 2 }}>
                Verified by service PIN at {dt(times.completedAt)}
              </Text>
            </View>
          )}
        </View>

        <Text style={s.footerNote} fixed>
          {data.ticketNumber} · Generated {dOnly(data.generatedAt)}
        </Text>
      </Page>

      {/* ── Page 2: Attachments (only when there are photos) ──── */}
      {hasPhotos && (
        <Page size="A4" style={s.page}>
          <DocHeader title={`Job Report — ${data.ticketNumber}`} right={dt(times.completedAt ?? times.bookedAt)} />
          <Text style={s.sectionTitle}>Attachments</Text>

          {photos.before.length > 0 && (
            <View style={s.block}>
              <Text style={{ ...s.value, ...s.bold, marginBottom: 6, textDecoration: "underline" }}>Before</Text>
              <View style={s.photoGrid}>
                {photos.before.map((p, i) => (
                  <Image key={i} src={p.dataUri} style={s.photo} />
                ))}
              </View>
            </View>
          )}

          {photos.after.length > 0 && (
            <View style={s.block}>
              <Text style={{ ...s.value, ...s.bold, marginBottom: 6, textDecoration: "underline" }}>After</Text>
              <View style={s.photoGrid}>
                {photos.after.map((p, i) => (
                  <Image key={i} src={p.dataUri} style={s.photo} />
                ))}
              </View>
            </View>
          )}

          <Text style={s.footerNote} fixed>
            {data.ticketNumber} · Generated {dOnly(data.generatedAt)}
          </Text>
        </Page>
      )}

      {/* ── Page 3: Tax Invoice ──────────────────────────────── */}
      <Page size="A4" style={s.page}>
        <Text style={{ ...s.headerTitle, textAlign: "center", marginBottom: 8 }}>Tax Invoice</Text>

        {/* Biller block + invoice meta, mirroring the reference layout */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: C.line }}>
          <View style={{ flex: 1.4, padding: 6, borderRightWidth: 1, borderRightColor: C.line }}>
            {data.audience === "customer" ? (
              <Image src={HANDYZO_LOGO_DATA_URI} style={{ width: 110, height: 28, objectFit: "contain", marginBottom: 4 }} />
            ) : (
              <Text style={s.billerName}>{biller.name}</Text>
            )}
            {biller.addressLines.map((l, i) => (
              <Text key={i} style={s.billerLine}>
                {l}
              </Text>
            ))}
            <Text style={s.billerLine}>
              {[biller.city, biller.state, biller.pincode].filter(Boolean).join(", ")}
            </Text>
            {biller.phone ? <Text style={s.billerLine}>Phone no.: {biller.phone}</Text> : null}
            {biller.email ? <Text style={s.billerLine}>Email: {biller.email}</Text> : null}
            {biller.gstin ? <Text style={s.billerLine}>GSTIN: {biller.gstin}</Text> : null}
            {biller.state ? (
              <Text style={s.billerLine}>
                State: {biller.stateCode ? `${biller.stateCode}-` : ""}
                {biller.state}
              </Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.line }}>
              <View style={{ flex: 1, padding: 5, borderRightWidth: 1, borderRightColor: C.line }}>
                <Text style={s.label}>Invoice No.</Text>
                <Text style={{ ...s.value, ...s.bold }}>{invoice.number}</Text>
              </View>
              <View style={{ flex: 1, padding: 5 }}>
                <Text style={s.label}>Date</Text>
                <Text style={{ ...s.value, ...s.bold }}>{dOnly(invoice.date)}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, padding: 5, borderRightWidth: 1, borderRightColor: C.line }}>
                <Text style={s.label}>Payment Mode</Text>
                <Text style={s.value}>{invoice.paymentMode}</Text>
              </View>
              <View style={{ flex: 1, padding: 5 }}>
                <Text style={s.label}>Job Reference</Text>
                <Text style={s.value}>{data.ticketNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={{ borderWidth: 1, borderTopWidth: 0, borderColor: C.line, padding: 6 }}>
          <Text style={s.label}>Bill To</Text>
          <Text style={{ ...s.value, ...s.bold }}>{customer.name}</Text>
          <Text style={s.billerLine}>{customer.addressLines.join(", ")}</Text>
          {customer.phone ? <Text style={s.billerLine}>Phone: {customer.phone}</Text> : null}
        </View>

        {/* Line items */}
        <View style={{ ...s.table, borderTopWidth: 0 }}>
          <View style={{ ...s.tr, ...s.headRow }}>
            <Text style={{ ...s.th, width: "5%" }}>#</Text>
            <Text style={{ ...s.th, width: "37%" }}>Item name</Text>
            <Text style={{ ...s.th, width: "12%" }}>HSN/ SAC</Text>
            <Text style={{ ...s.th, width: "10%" }}>Quantity</Text>
            <Text style={{ ...s.th, width: "8%" }}>Unit</Text>
            <Text style={{ ...s.th, width: "14%" }}>Price/ unit</Text>
            <Text style={{ ...s.th, width: "14%", borderRightWidth: 0 }}>Amount</Text>
          </View>
          {invoice.items.map((item, i) => (
            <View key={i} style={s.tr}>
              <Text style={{ ...s.td, width: "5%" }}>{i + 1}</Text>
              <Text style={{ ...s.td, width: "37%" }}>{item.name}</Text>
              <Text style={{ ...s.td, width: "12%" }}>{item.sac}</Text>
              <Text style={{ ...s.td, width: "10%" }}>{item.quantity}</Text>
              <Text style={{ ...s.td, width: "8%" }}>{item.unit}</Text>
              <Text style={{ ...s.td, width: "14%" }}>{money(item.unitPrice)}</Text>
              <Text style={{ ...s.td, width: "14%", borderRightWidth: 0 }}>{money(item.amount)}</Text>
            </View>
          ))}
          <View style={{ ...s.trLast, backgroundColor: C.faint }}>
            <Text style={{ ...s.td, width: "5%" }} />
            <Text style={{ ...s.td, width: "37%", ...s.bold }}>Total</Text>
            <Text style={{ ...s.td, width: "12%" }} />
            <Text style={{ ...s.td, width: "10%", ...s.bold }}>
              {invoice.items.reduce((n, i) => n + i.quantity, 0)}
            </Text>
            <Text style={{ ...s.td, width: "8%" }} />
            <Text style={{ ...s.td, width: "14%" }} />
            <Text style={{ ...s.td, width: "14%", borderRightWidth: 0, ...s.bold }}>{money(invoice.subtotal)}</Text>
          </View>
        </View>

        {/* Words + amounts */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderTopWidth: 0, borderColor: C.line }}>
          <View style={{ flex: 1.3, padding: 6, borderRightWidth: 1, borderRightColor: C.line }}>
            <Text style={s.label}>Invoice Amount In Words</Text>
            <Text style={{ ...s.value, ...s.bold }}>{invoice.amountInWords}</Text>
          </View>
          <View style={{ flex: 1, padding: 6 }}>
            <Text style={{ ...s.label, marginBottom: 4 }}>Amounts</Text>
            <View style={s.amountRow}>
              <Text style={s.value}>Sub Total</Text>
              <Text style={s.value}>{money(invoice.subtotal)}</Text>
            </View>
            {invoice.gst.interState ? (
              <View style={s.amountRow}>
                <Text style={s.value}>IGST</Text>
                <Text style={s.value}>{money(invoice.gst.igst)}</Text>
              </View>
            ) : (
              <>
                <View style={s.amountRow}>
                  <Text style={s.value}>CGST</Text>
                  <Text style={s.value}>{money(invoice.gst.cgst)}</Text>
                </View>
                <View style={s.amountRow}>
                  <Text style={s.value}>SGST</Text>
                  <Text style={s.value}>{money(invoice.gst.sgst)}</Text>
                </View>
              </>
            )}
            <View style={{ ...s.amountRow, borderTopWidth: 1, borderTopColor: C.line, marginTop: 3, paddingTop: 4 }}>
              <Text style={{ ...s.value, ...s.bold }}>Total</Text>
              <Text style={{ ...s.value, ...s.bold }}>{money(invoice.total)}</Text>
            </View>
            <View style={s.amountRow}>
              <Text style={s.value}>Received</Text>
              <Text style={s.value}>{money(invoice.received)}</Text>
            </View>
            <View style={s.amountRow}>
              <Text style={{ ...s.value, ...s.bold }}>Balance</Text>
              <Text style={{ ...s.value, ...s.bold }}>{money(invoice.balance)}</Text>
            </View>
          </View>
        </View>

        {/* Bank / terms / signatory */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderTopWidth: 0, borderColor: C.line }}>
          {data.bank && (
            <View style={{ flex: 1, padding: 6, borderRightWidth: 1, borderRightColor: C.line }}>
              <Text style={{ ...s.value, ...s.bold, marginBottom: 3 }}>Bank Details</Text>
              <Text style={s.billerLine}>Name: {data.bank.bankName}</Text>
              <Text style={s.billerLine}>Account No.: {data.bank.accountNumber}</Text>
              <Text style={s.billerLine}>IFSC code: {data.bank.ifsc}</Text>
              <Text style={s.billerLine}>Account Holder&apos;s Name:</Text>
              <Text style={s.billerLine}>{data.bank.accountName}</Text>
            </View>
          )}
          <View style={{ flex: 1.2, padding: 6, borderRightWidth: 1, borderRightColor: C.line }}>
            <Text style={{ ...s.value, ...s.bold, marginBottom: 3 }}>Terms and conditions</Text>
            {data.terms.map((t, i) => (
              <Text key={i} style={s.billerLine}>
                {i + 1}. {t}
              </Text>
            ))}
          </View>
          <View style={{ flex: 1, padding: 6, justifyContent: "space-between" }}>
            <Text style={{ ...s.billerLine, textAlign: "center" }}>For: {biller.name}</Text>
            <View style={{ alignItems: "center", marginTop: 26 }}>
              {signature.image ? (
                <Image src={signature.image.dataUri} style={{ width: 80, height: 32, objectFit: "contain" }} />
              ) : null}
              <Text style={{ ...s.value, ...s.bold }}>Authorized Signatory</Text>
            </View>
          </View>
        </View>

        <Text style={s.footerNote} fixed>
          {data.ticketNumber} · {data.audience === "customer" ? "Customer copy" : "Vendor copy"} · Generated{" "}
          {dOnly(data.generatedAt)}
        </Text>
      </Page>
    </Document>
  );
}
