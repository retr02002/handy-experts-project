import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { requireAdmin } from "@/lib/require-admin";
import type { BulkUploadType } from "@/actions/bulkupload.actions";

export async function GET(request: NextRequest) {
  const isAdmin = await requireAdmin();
  if (!isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") as BulkUploadType | null;

  if (!type || !["categories", "services", "packages"].includes(type)) {
    return new NextResponse("Invalid template type", { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Data");
  const instructionsSheet = workbook.addWorksheet("Instructions");

  if (type === "categories") {
    worksheet.columns = [
      { header: "name", key: "name", width: 25 },
      { header: "slug", key: "slug", width: 25 },
      { header: "description", key: "description", width: 40 },
      { header: "icon", key: "icon", width: 20 },
      { header: "image", key: "image", width: 30 },
      { header: "isActive", key: "isActive", width: 15 },
      { header: "isPopular", key: "isPopular", width: 15 },
      { header: "sortOrder", key: "sortOrder", width: 15 },
    ];
    worksheet.addRow({
      name: "Example Category",
      slug: "example-category",
      description: "This is an example",
      icon: "ph:wrench-bold",
      image: "https://example.com/image.jpg",
      isActive: "TRUE",
      isPopular: "FALSE",
      sortOrder: "1",
    });

    instructionsSheet.columns = [{ header: "Field", width: 20 }, { header: "Description", width: 80 }];
    instructionsSheet.addRows([
      ["name", "Required. The display name of the category."],
      ["slug", "Required. Unique URL-friendly identifier (e.g., ac-repair)."],
      ["description", "Optional text description."],
      ["icon", "Optional Iconify icon name (e.g., ph:wrench-bold)."],
      ["image", "Optional URL to an image."],
      ["isActive", "TRUE or FALSE. Defaults to FALSE if omitted."],
      ["isPopular", "TRUE or FALSE. Defaults to FALSE if omitted."],
      ["sortOrder", "Number used for ordering on the frontend."],
    ]);
  } else if (type === "services") {
    worksheet.columns = [
      { header: "title", key: "title", width: 25 },
      { header: "slug", key: "slug", width: 25 },
      { header: "categorySlug", key: "categorySlug", width: 25 },
      { header: "badge", key: "badge", width: 15 },
      { header: "badgeColor", key: "badgeColor", width: 15 },
      { header: "rating", key: "rating", width: 10 },
      { header: "image", key: "image", width: 30 },
      { header: "videoUrl", key: "videoUrl", width: 30 },
      { header: "time", key: "time", width: 15 },
      { header: "warranty", key: "warranty", width: 15 },
      { header: "description", key: "description", width: 40 },
      { header: "isPopular", key: "isPopular", width: 15 },
      { header: "benefits", key: "benefits", width: 40 },
      { header: "howItWorks", key: "howItWorks", width: 40 },
      { header: "faqs", key: "faqs", width: 40 },
    ];
    worksheet.addRow({
      title: "Example Service",
      slug: "example-service",
      categorySlug: "example-category",
      badge: "Best Seller",
      badgeColor: "blue",
      rating: "4.8",
      image: "https://example.com/image.jpg",
      videoUrl: "",
      time: "45 mins",
      warranty: "30 Days",
      description: "Service description here",
      isPopular: "TRUE",
      benefits: '[{"title":"Benefit 1","description":"Desc","icon":"ph:check"}]',
      howItWorks: '[{"step":1,"title":"Book","description":"Book online"}]',
      faqs: '[{"question":"Q1","answer":"A1"}]',
    });

    instructionsSheet.columns = [{ header: "Field", width: 20 }, { header: "Description", width: 80 }];
    instructionsSheet.addRows([
      ["title", "Required. The display title of the service."],
      ["slug", "Required. Unique identifier (e.g., ac-service)."],
      ["categorySlug", "Required. The slug of the parent category this service belongs to."],
      ["badge", "Optional badge text (e.g., Best Seller)."],
      ["badgeColor", "Optional badge color (e.g., blue)."],
      ["rating", "Optional string rating (e.g., 4.5)."],
      ["image", "Required. URL to an image."],
      ["videoUrl", "Optional video URL."],
      ["time", "Optional duration string (e.g., 45 mins)."],
      ["warranty", "Optional warranty string."],
      ["description", "Required. Text description."],
      ["isPopular", "TRUE or FALSE."],
      ["benefits", 'Optional. Valid JSON array (e.g. [{"title":"X","description":"Y","icon":"Z"}]).'],
      ["howItWorks", 'Optional. Valid JSON array (e.g. [{"step":1,"title":"X","description":"Y"}]).'],
      ["faqs", 'Optional. Valid JSON array (e.g. [{"question":"X","answer":"Y"}]).'],
    ]);
  } else if (type === "packages") {
    worksheet.columns = [
      { header: "name", key: "name", width: 25 },
      { header: "serviceSlug", key: "serviceSlug", width: 25 },
      { header: "price", key: "price", width: 15 },
      { header: "originalPrice", key: "originalPrice", width: 15 },
      { header: "time", key: "time", width: 15 },
      { header: "category", key: "category", width: 20 },
      { header: "tag", key: "tag", width: 15 },
      { header: "rating", key: "rating", width: 10 },
      { header: "image", key: "image", width: 30 },
      { header: "features", key: "features", width: 40 },
      { header: "details", key: "details", width: 40 },
    ];
    worksheet.addRow({
      name: "Standard Package",
      serviceSlug: "example-service",
      price: "499",
      originalPrice: "699",
      time: "1 hour",
      category: "Standard",
      tag: "Most Popular",
      rating: "4.9",
      image: "https://example.com/image.jpg",
      features: "Deep cleaning; Filter check; Gas check",
      details: "Optional detail 1; Optional detail 2",
    });

    instructionsSheet.columns = [{ header: "Field", width: 20 }, { header: "Description", width: 80 }];
    instructionsSheet.addRows([
      ["name", "Required. Display name of the package."],
      ["serviceSlug", "Required. The slug of the service this package belongs to."],
      ["price", "Required. Numeric price."],
      ["originalPrice", "Required. Numeric original price (before discount)."],
      ["time", "Optional time estimate."],
      ["category", "Optional package category text."],
      ["tag", "Optional tag (e.g. Recommended)."],
      ["rating", "Optional rating string."],
      ["image", "Optional image URL."],
      ["features", "Required. Semicolon-separated list of features (e.g., Feature 1; Feature 2)."],
      ["details", "Optional. Semicolon-separated list of extra details."],
    ]);
  }

  // Formatting for all templates
  worksheet.getRow(1).font = { bold: true };
  instructionsSheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}_template.xlsx"`,
    },
  });
}
