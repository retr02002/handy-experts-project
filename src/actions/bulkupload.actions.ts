"use server";

import { requireAdmin } from "@/lib/require-admin";
import type { ActionResponse } from "./auth.actions";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";
import stream from "stream";

export type BulkUploadType = "categories" | "services" | "packages";

export interface BulkUploadResult {
  processed: number;
  created: number;
  updated: number;
  errors: string[];
}

export async function processBulkUploadAction(
  formData: FormData,
  type: BulkUploadType
): Promise<ActionResponse<BulkUploadResult>> {
  if (!(await requireAdmin())) return { success: false, error: "Not authorized" };

  const file = formData.get("file") as File | null;
  if (!file) return { success: false, error: "No file provided" };

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const workbook = new ExcelJS.Workbook();

  try {
    if (file.name.endsWith(".csv")) {
      const readable = stream.Readable.from(buffer);
      await workbook.csv.read(readable);
    } else {
      await workbook.xlsx.load(buffer as any);
    }
  } catch (err) {
    console.error("Failed to parse file:", err);
    return { success: false, error: "Invalid file format. Please upload a valid CSV or XLSX." };
  }

  // Assuming data is in the first sheet (or the only sheet for CSV)
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return { success: false, error: "Spreadsheet is empty" };

  const headers: Record<number, string> = {};
  const rows: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.text?.trim();
      });
    } else {
      const rowData: Record<string, any> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          rowData[header] = cell.value?.toString().trim() || "";
        }
      });
      rows.push(rowData);
    }
  });

  if (rows.length === 0) {
    return { success: false, error: "No data rows found" };
  }

  const result: BulkUploadResult = { processed: 0, created: 0, updated: 0, errors: [] };

  try {
    if (type === "categories") {
      await processCategories(rows, result);
    } else if (type === "services") {
      await processServices(rows, result);
    } else if (type === "packages") {
      await processPackages(rows, result);
    }
  } catch (err: any) {
    console.error("Bulk upload processing error:", err);
    return { success: false, error: "An error occurred during processing: " + err.message };
  }

  // Revalidate relevant paths
  revalidatePath("/admin/categories");
  revalidatePath("/admin/services");
  revalidatePath("/admin/packages");

  return { success: true, data: result };
}

async function processCategories(rows: any[], result: BulkUploadResult) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +1 for 0-index, +1 for header
    try {
      const name = row["name"];
      const slug = row["slug"];
      if (!name || !slug) {
        result.errors.push(`Row ${rowNum}: 'name' and 'slug' are required`);
        continue;
      }

      const sortOrder = parseInt(row["sortOrder"], 10);
      const isActive = row["isActive"]?.toLowerCase() === "true" || row["isActive"] === "1";
      const isPopular = row["isPopular"]?.toLowerCase() === "true" || row["isPopular"] === "1";

      const data = {
        name,
        slug,
        description: row["description"] || null,
        icon: row["icon"] || null,
        image: row["image"] || null,
        isActive,
        isPopular,
        sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
      };

      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        await prisma.category.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.category.create({ data });
        result.created++;
      }
      result.processed++;
    } catch (err: any) {
      result.errors.push(`Row ${rowNum}: ${err.message}`);
    }
  }
}

async function processServices(rows: any[], result: BulkUploadResult) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    try {
      const title = row["title"];
      const slug = row["slug"];
      const categorySlug = row["categorySlug"];
      const description = row["description"];
      const image = row["image"];

      if (!title || !slug || !categorySlug || !description || !image) {
        result.errors.push(`Row ${rowNum}: 'title', 'slug', 'categorySlug', 'description', and 'image' are required`);
        continue;
      }

      const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (!category) {
        result.errors.push(`Row ${rowNum}: Category with slug '${categorySlug}' not found`);
        continue;
      }

      const isPopular = row["isPopular"]?.toLowerCase() === "true" || row["isPopular"] === "1";

      let benefits = [];
      let howItWorks = [];
      let faqs = [];
      try { if (row["benefits"]) benefits = JSON.parse(row["benefits"]); } catch { result.errors.push(`Row ${rowNum}: Invalid JSON in benefits`); continue; }
      try { if (row["howItWorks"]) howItWorks = JSON.parse(row["howItWorks"]); } catch { result.errors.push(`Row ${rowNum}: Invalid JSON in howItWorks`); continue; }
      try { if (row["faqs"]) faqs = JSON.parse(row["faqs"]); } catch { result.errors.push(`Row ${rowNum}: Invalid JSON in faqs`); continue; }

      const data = {
        title,
        slug,
        categoryId: category.id,
        badge: row["badge"] || null,
        badgeColor: row["badgeColor"] || null,
        rating: row["rating"] || null,
        image,
        videoUrl: row["videoUrl"] || null,
        time: row["time"] || null,
        warranty: row["warranty"] || null,
        description,
        isPopular,
        benefits,
        howItWorks,
        faqs,
      };

      const existing = await prisma.service.findUnique({ where: { slug } });
      if (existing) {
        await prisma.service.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.service.create({ data });
        result.created++;
      }
      result.processed++;
    } catch (err: any) {
      result.errors.push(`Row ${rowNum}: ${err.message}`);
    }
  }
}

async function processPackages(rows: any[], result: BulkUploadResult) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    try {
      const name = row["name"];
      const serviceSlug = row["serviceSlug"];
      const priceStr = row["price"];
      const originalPriceStr = row["originalPrice"];
      
      if (!name || !serviceSlug || !priceStr || !originalPriceStr) {
        result.errors.push(`Row ${rowNum}: 'name', 'serviceSlug', 'price', and 'originalPrice' are required`);
        continue;
      }

      const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
      if (!service) {
        result.errors.push(`Row ${rowNum}: Service with slug '${serviceSlug}' not found`);
        continue;
      }

      const price = parseFloat(priceStr);
      const originalPrice = parseFloat(originalPriceStr);

      if (isNaN(price) || isNaN(originalPrice)) {
        result.errors.push(`Row ${rowNum}: 'price' and 'originalPrice' must be valid numbers`);
        continue;
      }

      // Features and details are semicolon separated
      const features = row["features"] ? row["features"].split(";").map((f: string) => f.trim()).filter(Boolean) : [];
      const details = row["details"] ? row["details"].split(";").map((f: string) => f.trim()).filter(Boolean) : [];

      if (features.length === 0) {
        result.errors.push(`Row ${rowNum}: At least one feature is required`);
        continue;
      }

      const data = {
        name,
        serviceId: service.id,
        price,
        originalPrice,
        time: row["time"] || null,
        category: row["category"] || null,
        tag: row["tag"] || null,
        rating: row["rating"] || null,
        image: row["image"] || null,
        features,
        details,
      };

      // We uniquely identify a package by serviceId and name, as there's no slug on packages
      const existing = await prisma.servicePackage.findFirst({
        where: { serviceId: service.id, name },
      });

      if (existing) {
        await prisma.servicePackage.update({ where: { id: existing.id }, data });
        result.updated++;
      } else {
        await prisma.servicePackage.create({ data });
        result.created++;
      }
      result.processed++;
    } catch (err: any) {
      result.errors.push(`Row ${rowNum}: ${err.message}`);
    }
  }
}
