/* eslint-disable jsx-a11y/alt-text --
   <Image> here is @react-pdf/renderer's PDF primitive, not an HTML <img>.
   The PDF image operator has no alt attribute, so the rule is matching on
   the component name alone and there is nothing meaningful to add. */
import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { TechnicianIdCardData } from "./idCardData";

/**
 * Server-rendered react-pdf tree. Deliberately NOT a "use client" module —
 * @react-pdf/renderer must never reach a browser bundle, so nothing with
 * "use client" may import this file. Only the id-card route does. Layout
 * mirrors IdCardPreview.tsx's HTML/CSS version so the PDF and PNG downloads
 * can't visually drift apart.
 */

const C = {
  ink: "#0f172a",
  muted: "#64748b",
  line: "#e2e8f0",
  white: "#ffffff",
  brand: "#00B4FF",
  brandTint: "#e0f6ff",
};

// 259x417pt keeps the 360:580 badge aspect ratio used by the HTML preview,
// at a print-friendly scale — this isn't going to a physical card printer,
// just a PDF for on-screen/print use, so exact card-stock dimensions don't matter.
const s = StyleSheet.create({
  page: { width: 259, height: 417, fontFamily: "Helvetica", color: C.ink, backgroundColor: C.white },

  header: { alignItems: "center", paddingTop: 16, paddingBottom: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerLogo: { width: 20, height: 20, borderRadius: 5 },
  wordmark: { fontSize: 17, fontFamily: "Helvetica-Bold" },
  wordmarkAccent: { color: C.brand },
  tagline: { fontSize: 8, color: C.muted, marginTop: 2, letterSpacing: 0.3 },

  photoWrap: { alignItems: "center" },
  photoFrame: { width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: C.brandTint, overflow: "hidden", backgroundColor: C.line },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },

  nameBlock: { alignItems: "center", marginTop: 8, paddingHorizontal: 12 },
  name: { fontSize: 15, fontFamily: "Helvetica-Bold", textAlign: "center" },
  roleBadge: { backgroundColor: C.brandTint, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2.5, marginTop: 4 },
  roleBadgeText: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.brand, letterSpacing: 0.5 },
  secondaryLine: { fontSize: 9, color: C.muted, marginTop: 4 },

  divider: { borderBottomWidth: 1, borderBottomColor: C.line, marginTop: 10, marginHorizontal: 16 },

  detailList: { marginTop: 8, marginHorizontal: 16 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.line },
  detailRowLast: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 },
  detailLabel: { fontSize: 9, color: C.muted },
  detailValue: { fontSize: 9.5, fontFamily: "Helvetica-Bold", maxWidth: 140, textAlign: "right" },
  detailValueRow: { flexDirection: "row", alignItems: "center", gap: 4, maxWidth: 140 },
  vendorLogo: { width: 12, height: 12, objectFit: "contain" },

  bottomRow: { alignItems: "center", marginTop: 12, marginHorizontal: 16 },
  sigBlock: { alignItems: "center" },
  sigImage: { width: 120, height: 40, objectFit: "contain" },
  sigPlaceholder: { width: 120, height: 40, borderWidth: 1, borderStyle: "dashed", borderColor: C.line, alignItems: "center", justifyContent: "center" },
  sigPlaceholderText: { fontSize: 8, color: C.muted },
  sigRule: { borderBottomWidth: 1, borderBottomColor: C.ink, width: 120, marginTop: 2 },
  sigCaption: { fontSize: 7.5, color: C.muted, marginTop: 3 },

  footerAccent: { position: "absolute", bottom: 0, left: 0, right: 0, height: 8, backgroundColor: C.brand },
  footerMicrocopy: { position: "absolute", bottom: 12, left: 14, right: 14, fontSize: 7, color: C.muted, textAlign: "center" },
});

function DetailRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? s.detailRowLast : s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue}>{value}</Text>
    </View>
  );
}

export function IdCardDocument({ data }: { data: TechnicianIdCardData }) {
  const experienceLabel = `${data.experienceYears} yr${data.experienceYears === 1 ? "" : "s"}`;
  const ratingLabel = data.rating ? `${data.rating.avg.toFixed(1)} ★ (${data.rating.count})` : "New";
  const nameParts = data.platformName.length > 5 ? [data.platformName.slice(0, 5), data.platformName.slice(5)] : [data.platformName, ""];

  return (
    <Document>
      <Page size={[259, 417]} style={s.page}>
        <View style={s.header}>
          <View style={s.headerRow}>
            {data.platformLogo && <Image src={data.platformLogo.dataUri} style={s.headerLogo} />}
            <Text style={s.wordmark}>
              {nameParts[0].toUpperCase()}
              <Text style={s.wordmarkAccent}>{nameParts[1].toUpperCase()}</Text>
            </Text>
          </View>
          <Text style={s.tagline}>{data.platformTagline}</Text>
        </View>

        <View style={s.photoWrap}>
          <View style={s.photoFrame}>
            {data.photo ? (
              <Image src={data.photo.dataUri} style={s.photo} />
            ) : (
              <View style={s.photoPlaceholder}>
                <Text style={{ fontSize: 9, color: C.muted }}>No photo</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.nameBlock}>
          <Text style={s.name}>{data.name}</Text>
          <View style={s.roleBadge}>
            <Text style={s.roleBadgeText}>TECHNICIAN</Text>
          </View>
          <Text style={s.secondaryLine}>
            {data.role} · {experienceLabel} · {ratingLabel}
          </Text>
        </View>

        <View style={s.divider} />

        <View style={s.detailList}>
          <DetailRow label="Technician ID" value={data.idNumber} />
          <DetailRow label="Category" value={data.role} />
          <View style={s.detailRowLast}>
            <Text style={s.detailLabel}>Vendor</Text>
            <View style={s.detailValueRow}>
              {data.vendor?.logo && <Image src={data.vendor.logo.dataUri} style={s.vendorLogo} />}
              <Text style={s.detailValue}>{data.vendor ? data.vendor.name : "Independent"}</Text>
            </View>
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.bottomRow}>
          <View style={s.sigBlock}>
            {data.signature ? (
              <Image src={data.signature.dataUri} style={s.sigImage} />
            ) : (
              <View style={s.sigPlaceholder}>
                <Text style={s.sigPlaceholderText}>Not signed</Text>
              </View>
            )}
            <View style={s.sigRule} />
            <Text style={s.sigCaption}>Authorized Signature</Text>
          </View>
        </View>

        <Text style={s.footerMicrocopy}>
          This card is property of {data.platformName}. If found, please contact support.
        </Text>
        <View style={s.footerAccent} />
      </Page>
    </Document>
  );
}
