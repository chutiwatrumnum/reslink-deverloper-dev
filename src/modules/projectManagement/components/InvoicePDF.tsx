import React from "react";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
  pdf,
} from "@react-pdf/renderer";
import type {
  InvoiceData,
  FeatureItem,
} from "../../../stores/interfaces/ProjectManage";
import localLogo from "../../../assets/images/invoiceLogo.png";

// ------- Fonts (ใช้ default) -------
Font.registerEmojiSource({
  format: "png",
  url: "https://twemoji.maxcdn.com/v/latest/72x72/",
});

// ------- Styles -------
const ROW_HEIGHT = 24;
const CAT_COL_WIDTH = "28%";
const FEAT_COL_WIDTH = "52%";
const PRICE_COL_WIDTH = "20%";

const styles = StyleSheet.create({
  // ===== Page =====
  page: {
    padding: 32,
    paddingBottom: 64,
    fontSize: 11,
    color: "#002C55",
  },

  // ===== Header / Logo =====
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  logo: { height: 24 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 18,
    marginBottom: 12,
    color: "#0A2C55",
  },

  // ===== Address =====
  addrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 14,
  },
  addrCol: { width: "48%" },
  addrLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0A2C55",
    marginBottom: 6,
  },
  addrBox: {},
  addrText: { lineHeight: 1 },

  // ===== Date / Order table =====
  infoTable: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 6,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  infoKeyCell: {
    width: "40%",
    padding: 4,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
  },
  infoValCell: {
    width: "60%",
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
  },
  infoKeyText: { fontWeight: "bold", color: "#0A2C55" },
  infoValText: { color: "#0A2C55" },

  // ===== Table =====
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderColor: "#E5E7EB",
    marginTop: 14,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
  },
  tableNoTopBorder: { borderTopWidth: 0 },

  // ===== Generic row =====
  row: {
    flexDirection: "row",
    alignItems: "stretch", // บังคับทุกคอลัมน์สูงเท่ากัน
  },

  // ===== Cell base =====
  cell: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },
  cellLast: {
    flex: 1,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },

  // ===== Header cells =====
  headerRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  headerCellCat: {
    width: CAT_COL_WIDTH,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },
  headerCellFeat: {
    width: FEAT_COL_WIDTH,
    backgroundColor: "#F8FAFC",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    height: ROW_HEIGHT,
  },
  headerCellPrice: {
    width: PRICE_COL_WIDTH,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },
  headerText: { fontWeight: "bold" },

  // ===== Body columns =====
  bodyColCat: {
    width: CAT_COL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  bodyColFeat: {
    width: FEAT_COL_WIDTH,
    display: "flex",
    flexDirection: "column",
  },
  bodyColPrice: {
    width: PRICE_COL_WIDTH,
    display: "flex",
    flexDirection: "column",
  },

  // ===== Inner cells for stacked columns =====
  rowCellFeat: {
    height: ROW_HEIGHT,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
  },
  rowCellFeatLast: {
    height: ROW_HEIGHT,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
  },
  rowCellPrice: {
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  rowCellPriceLast: {
    height: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  // === Summary table columns: match main table widths ===
  sumRow: { flexDirection: "row", alignItems: "stretch" },
  sumCellCat: {
    width: CAT_COL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },
  sumCellFeat: {
    width: FEAT_COL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    height: ROW_HEIGHT,
  },
  sumCellPrice: {
    width: PRICE_COL_WIDTH,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: ROW_HEIGHT,
  },

  // ===== Merge for Category =====
  vMergeCell: {
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== Text utilities =====
  textLeft: { textAlign: "left" },
  textCenter: { textAlign: "center" },
  bold: { fontWeight: "bold" },

  // ===== Footer =====
  mt12: { marginTop: 24 },
  muted: { fontSize: 10, color: "#6B7280" },
  hr: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },
  footer: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    left: 32,
    color: "#6B7280",
  },
  pageNum: {
    position: "absolute",
    fontSize: 9,
    bottom: 20,
    right: 32,
    color: "#6B7280",
  },
});

// ------- Utilities -------
const padPrice = (n: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    const dd = d.getDate().toString().padStart(2, "0");
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch {
    return iso;
  }
};

// ------- Mock data -------
const mockData: InvoiceData = {
  logo: {
    invoiceLogo:
      "https://boulevard-storage-dev.sgp1.digitaloceanspaces.com/reslink/invoice/invoice-logo.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=DO00FB46EXGM9HHFR478%2F20250831%2Fsgp1%2Fs3%2Faws4_request&X-Amz-Date=20250831T075731Z&X-Amz-Expires=3000&X-Amz-Signature=a7b001c62b2b13b6dab8efede08602f43166499afa9a2ff48aa505d803e2cc7f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
  },
  address: {
    customerAddress:
      "Lumitech Villa, Lumitech Co.,Ltd.\n120 Sukhumvit 21, Asoke Rd,\nKhlong Toei Nuea, Wattana, Bangkok,\n10110, Thailand",
    lifeStyleAddress:
      "Lifestyle Technologies Co.,Ltd.\n15 Soi Sirinthron 5, Sirinthron Rd,\nBangbumru, Bangplud, Bangkok,\n10700, Thailand",
  },
  tableOrder: {
    createdAt: new Date().toISOString(),
    orderNo: "12345678909090",
  },
  tableFeatures: {
    standardBasePrice: 50000,
    vatPercent: 7,
    totalVat: 3150,
    totalPrice: 45000,
    totalPriceWithVat: 48150,
    groupedData: {
      standard: [
        {
          id: "c19917f8-91be-4e95-9248-12341514512",
          code: "contact_list",
          name: "Notification",
          type: "standard",
          price: 0,
          sorted: 1,
          active: true,
          isDefault: true,
        },
        {
          id: "c19917f8-91be-4e95-9248-e9413790f3fb",
          code: "contact_list",
          name: "Contact list",
          type: "standard",
          price: 0,
          sorted: 1,
          active: true,
          isDefault: true,
        },
        {
          id: "3d1112a1-0d34-4bdb-bb6d-40b0af7fcc4e",
          code: "document",
          name: "Document",
          type: "standard",
          price: 0,
          sorted: 2,
          active: true,
          isDefault: true,
        },
        {
          id: "ad301b70-4766-4a0c-b848-badb4fae986f",
          code: "events",
          name: "Events",
          type: "standard",
          price: 0,
          sorted: 3,
          active: true,
          isDefault: true,
        },
        {
          id: "c8c0910a-d8d3-429e-8510-2bb082791902",
          code: "fixing_report",
          name: "Fixing report",
          type: "standard",
          price: 0,
          sorted: 4,
          active: true,
          isDefault: true,
        },
        {
          id: "3b9b5361-579d-4e01-a779-2b9ad0b3db04",
          code: "home_automation",
          name: "Home automation",
          type: "standard",
          price: 0,
          sorted: 5,
          active: true,
          isDefault: true,
        },
        {
          id: "c4abe73c-186e-4ed8-89e0-4699936076fd",
          code: "left_home_with_guard",
          name: "Left home with guard",
          type: "standard",
          price: 0,
          sorted: 6,
          active: true,
          isDefault: true,
        },
        {
          id: "7b9734a7-5281-4d52-8d6b-7205c47b0f4c",
          code: "live_chat",
          name: "Live chat",
          type: "standard",
          price: 0,
          sorted: 7,
          active: true,
          isDefault: true,
        },
        {
          id: "7afa1eec-41a6-4a82-89e8-3fb0aedc02bc",
          code: "maintenance_guide",
          name: "Maintenance guide",
          type: "standard",
          price: 0,
          sorted: 8,
          active: true,
          isDefault: true,
        },
        {
          id: "52cc3b0b-7f72-45ef-8142-0ccaaca98812",
          code: "my_pets",
          name: "My pets",
          type: "standard",
          price: 0,
          sorted: 9,
          active: true,
          isDefault: true,
        },
        {
          id: "5d85f0ad-196e-4c74-9026-e9c1c3d20164",
          code: "news_and_announcement",
          name: "News and announcement",
          type: "standard",
          price: 0,
          sorted: 10,
          active: true,
          isDefault: true,
        },
        {
          id: "5ea60901-1d60-4f86-9113-233e67c2ff0e",
          code: "parcel_alert",
          name: "Parcel alert",
          type: "standard",
          price: 0,
          sorted: 12,
          active: true,
          isDefault: true,
        },
        {
          id: "79c27781-a01c-437d-9283-12341",
          code: "services",
          name: "Services",
          type: "standard",
          price: 0,
          sorted: 13,
          active: true,
          isDefault: true,
        },
        {
          id: "b821b9d9-9f86-4d9b-abfd-8b752f815176",
          code: "sos",
          name: "SOS",
          type: "standard",
          price: 0,
          sorted: 14,
          active: true,
          isDefault: true,
        },
        {
          id: "219d53a7-bf10-43db-9ecf-4ec73fda0d83",
          code: "warranty_tracking",
          name: "Warranty tracking",
          type: "standard",
          price: 0,
          sorted: 15,
          active: true,
          isDefault: true,
        },
        {
          id: "17f78660-dc4a-4237-b9ce-a729a5a735a6",
          code: "weather_forecast",
          name: "Weather forecast",
          type: "standard",
          price: 0,
          sorted: 16,
          active: true,
          isDefault: true,
        },
        {
          id: "7d463f41-06af-4869-a3a1-39c0fe6394f3",
          code: "users_management",
          name: "Users management",
          type: "standard",
          price: 0,
          sorted: 17,
          active: true,
          isDefault: true,
        },
      ],
      optional: [
        {
          id: "o1",
          code: "bill_and_payment",
          name: "Bill and Payment",
          type: "optional",
          price: 5000,
          sorted: 1,
          active: true,
          isDefault: false,
        },
        {
          id: "63c7b263-4878-40b9-b310-582305eba001",
          code: "facility_booking",
          name: "Facility booking",
          type: "optional",
          price: 10000.45,
          sorted: 3,
          active: true,
          isDefault: false,
        },
        {
          id: "16970cbf-8388-4ab7-85a9-7acf4924a98a",
          code: "people_counting",
          name: "People counting",
          type: "optional",
          price: 10000,
          sorted: 7,
          active: true,
          isDefault: false,
        },
        {
          id: "41c3403f-38f0-493e-acb4-abdb83806c69",
          code: "privilege",
          name: "Privilege",
          type: "optional",
          price: 10000,
          sorted: 2,
          active: true,
          isDefault: false,
        },
      ],
    },
  },
  footerData: { supportEmail: "support@nexres.com" },
};

// ------- Main PDF Component -------
const GroupBlock: React.FC<{
  label: "Standard features" | "Optional features";
  items: FeatureItem[];
  standardBasePrice?: number;
}> = ({ label, items, standardBasePrice }) => {
  if (!items.length) return null;

  const groupHeight = items.length * ROW_HEIGHT;

  return (
    <View style={styles.table}>
      {/* Header row */}
      <View style={styles.headerRow} wrap={false}>
        <View style={styles.headerCellCat}>
          <Text style={[styles.headerText, styles.textCenter]}>Category</Text>
        </View>
        <View style={styles.headerCellFeat}>
          <Text style={[styles.headerText, styles.textLeft]}>Feature</Text>
        </View>
        <View style={styles.headerCellPrice}>
          <Text style={[styles.headerText, styles.textCenter]}>
            Price (THB)
          </Text>
        </View>
      </View>

      {/* Body rows */}
      <View style={styles.row} wrap={false} minPresenceAhead={groupHeight + 8}>
        {/* Column 1: Category (merged cell) */}
        <View
          style={[
            styles.bodyColCat,
            styles.vMergeCell,
            { height: groupHeight },
          ]}
        >
          <Text style={styles.textCenter}>{label}</Text>
        </View>

        {/* Column 2: Features (list) */}
        <View style={styles.bodyColFeat}>
          {items.map((it, i) => (
            <View
              key={it.id || `${label}-${i}`}
              style={
                i === items.length - 1
                  ? styles.rowCellFeatLast
                  : styles.rowCellFeat
              }
            >
              <Text style={styles.textLeft}>{it.name}</Text>
            </View>
          ))}
        </View>

        {/* Column 3: Price */}
        {label === "Standard features" ? (
          // สำหรับ Standard: ผสานเซลล์ราคากลางเดียว
          <View
            style={[
              styles.bodyColPrice,
              styles.vMergeCell,
              {
                height: groupHeight,
                borderBottomWidth: 1,
                borderBottomColor: "#E5E7EB",
              },
            ]}
          >
            <Text style={[styles.textCenter, styles.bold]}>
              {padPrice(standardBasePrice || 0)}
            </Text>
          </View>
        ) : (
          // สำหรับ Optional: ราคาทีละบรรทัด
          <View style={styles.bodyColPrice}>
            {items.map((it, i) => (
              <View
                key={`opt-price-${it.id || i}`}
                style={
                  i === items.length - 1
                    ? styles.rowCellPriceLast
                    : styles.rowCellPrice
                }
              >
                <Text style={styles.textCenter}>{padPrice(it.price || 0)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ===== เปลี่ยนค่าได้ตรงนี้ =====
const MAX_FEATURES_PER_PAGE = 10; // จำนวนฟีเจอร์รวมสูงสุดที่ยังอยู่หน้าเดียว

const InvoiceDocument: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const d = data ?? mockData;
  const std = d?.tableFeatures?.groupedData?.standard ?? [];
  const opt = d?.tableFeatures?.groupedData?.optional ?? [];
  const totalFeatures = std.length + opt.length;

  const singlePageMode = totalFeatures <= MAX_FEATURES_PER_PAGE;

  if (singlePageMode) {
    // ========== โหมดหน้าเดียว ==========
    return (
      <Document>
        <Page size="A4" style={styles.page} wrap>
          {/* Header / Logo */}
          <View style={styles.brandRow}>
            {d.logo?.invoiceLogo ? (
              <Image src={localLogo} style={styles.logo} />
            ) : (
              <View />
            )}
            <View style={{ width: 120 }} />
          </View>
          <Text style={styles.title}>Invoice</Text>

          {/* Address */}
          <View style={styles.addrRow}>
            <View style={styles.addrCol}>
              <Text style={styles.addrLabel}>From</Text>
              <View style={styles.addrBox}>
                <Text style={styles.addrText}>
                  {d.address.lifeStyleAddress}
                </Text>
              </View>
            </View>
            <View style={styles.addrCol}>
              <Text style={styles.addrLabel}>Customer detail</Text>
              <View style={styles.addrBox}>
                <Text style={styles.addrText}>{d.address.customerAddress}</Text>
              </View>
            </View>
          </View>

          {/* Date & Order */}
          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <View style={styles.infoKeyCell}>
                <Text style={styles.infoKeyText}>Date</Text>
              </View>
              <View style={styles.infoValCell}>
                <Text style={styles.infoValText}>
                  {formatDate(d.tableOrder.createdAt)}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoKeyCell}>
                <Text style={styles.infoKeyText}>Order no :</Text>
              </View>
              <View style={styles.infoValCell}>
                <Text style={styles.infoValText}>{d.tableOrder.orderNo}</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.mt12, styles.bold]}>Yearly Package price</Text>

          {/* ตาราง Standard + Optional ต่อกันในหน้าเดียว */}
          <GroupBlock
            label="Standard features"
            items={std}
            standardBasePrice={d.tableFeatures.standardBasePrice}
          />
          <GroupBlock label="Optional features" items={opt} />

          {/* Summary (ใช้ table ปกติของคุณ หรือบล็อกสรุปที่ทำไว้) */}
          <View wrap={false} minPresenceAhead={ROW_HEIGHT * 3 + 16}>
            <View style={styles.table}>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <Text>{""}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.bold, styles.textLeft]}>
                    VAT {d.tableFeatures.vatPercent}%
                  </Text>
                </View>
                <View style={styles.cellLast}>
                  <Text style={[styles.bold, styles.textCenter]}>
                    {padPrice(d.tableFeatures.totalVat)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <Text>{""}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.bold, styles.textLeft]}>Subtotal</Text>
                </View>
                <View style={styles.cellLast}>
                  <Text style={[styles.bold, styles.textCenter]}>
                    {padPrice(d.tableFeatures.totalPrice)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.cell}>
                  <Text>{""}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={[styles.bold, styles.textLeft]}>Total</Text>
                </View>
                <View style={styles.cellLast}>
                  <Text style={[styles.bold, styles.textCenter]}>
                    {padPrice(d.tableFeatures.totalPriceWithVat)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.mt12} wrap={false}>
            <Text style={styles.muted}>
              For inquiries please contact {d.footerData?.supportEmail}
            </Text>
          </View>

          {/* Footer */}
          <Text
            style={styles.footer}
            render={() => "Lifestyle Technologies Co.,Ltd."}
            fixed
          />
          <Text
            style={styles.pageNum}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber}/${totalPages}`
            }
            fixed
          />
        </Page>
      </Document>
    );
  }

  // ========== โหมด 2 หน้า (เกิน MAX_FEATURES_PER_PAGE) ==========
  return (
    <Document>
      {/* Page 1: Standard */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.brandRow}>
          {d.logo?.invoiceLogo ? (
            <Image src={localLogo} style={styles.logo} />
          ) : (
            <View />
          )}
          <View style={{ width: 120 }} />
        </View>
        <Text style={styles.title}>Invoice</Text>

        <View style={styles.addrRow}>
          <View style={styles.addrCol}>
            <Text style={styles.addrLabel}>From</Text>
            <View style={styles.addrBox}>
              <Text style={styles.addrText}>{d.address.lifeStyleAddress}</Text>
            </View>
          </View>
          <View style={styles.addrCol}>
            <Text style={styles.addrLabel}>Customer detail</Text>
            <View style={styles.addrBox}>
              <Text style={styles.addrText}>{d.address.customerAddress}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <View style={styles.infoKeyCell}>
              <Text style={styles.infoKeyText}>Date</Text>
            </View>
            <View style={styles.infoValCell}>
              <Text style={styles.infoValText}>
                {formatDate(d.tableOrder.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoKeyCell}>
              <Text style={styles.infoKeyText}>Order no :</Text>
            </View>
            <View style={styles.infoValCell}>
              <Text style={styles.infoValText}>{d.tableOrder.orderNo}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.mt12, styles.bold]}>Yearly Package price</Text>

        <GroupBlock
          label="Standard features"
          items={std}
          standardBasePrice={d.tableFeatures.standardBasePrice}
        />

        <Text
          style={styles.footer}
          render={() => "Lifestyle Technologies Co.,Ltd."}
          fixed
        />
        <Text
          style={styles.pageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
          fixed
        />
      </Page>

      {/* Page 2: Optional + Summary + Notes */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.brandRow}>
          {d.logo?.invoiceLogo ? (
            <Image src={d.logo.invoiceLogo} style={styles.logo} />
          ) : (
            <View />
          )}
          <View style={{ width: 120 }} />
        </View>
        <Text style={styles.title}>Invoice (continued)</Text>

        <GroupBlock label="Optional features" items={opt} />

        <View wrap={false} minPresenceAhead={ROW_HEIGHT * 3 + 16}>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text>{""}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.bold, styles.textLeft]}>
                  VAT {d.tableFeatures.vatPercent}%
                </Text>
              </View>
              <View style={styles.cellLast}>
                <Text style={[styles.bold, styles.textCenter]}>
                  {padPrice(d.tableFeatures.totalVat)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text>{""}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.bold, styles.textLeft]}>Subtotal</Text>
              </View>
              <View style={styles.cellLast}>
                <Text style={[styles.bold, styles.textCenter]}>
                  {padPrice(d.tableFeatures.totalPrice)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.cell}>
                <Text>{""}</Text>
              </View>
              <View style={styles.cell}>
                <Text style={[styles.bold, styles.textLeft]}>Total</Text>
              </View>
              <View style={styles.cellLast}>
                <Text style={[styles.bold, styles.textCenter]}>
                  {padPrice(d.tableFeatures.totalPriceWithVat)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.mt12} wrap={false}>
          <Text style={styles.muted}>
            For inquiries please contact {d.footerData?.supportEmail}
          </Text>
        </View>

        <Text
          style={styles.footer}
          render={() => "Lifestyle Technologies Co.,Ltd."}
          fixed
        />
        <Text
          style={styles.pageNum}
          render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  );
};

export async function openInvoicePdf(data: InvoiceData) {
  const blob = await pdf(<InvoiceDocument data={data} />).toBlob();
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export function computeTotals(
  basePrice: number,
  optional: FeatureItem[],
  vatPercent: number
) {
  const optSum = optional.reduce((s, i) => s + (i.price || 0), 0);
  const subtotal = basePrice + optSum;
  const vat = +(subtotal * (vatPercent / 100)).toFixed(2);
  const grand = +(subtotal + vat).toFixed(2);
  return { subtotal, vat, grand };
}

export default InvoiceDocument;
