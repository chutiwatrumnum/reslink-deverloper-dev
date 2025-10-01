import { FeatureItem } from "../../../stores/interfaces/ProjectManage";
import { ReceiptDataType } from "../../../stores/interfaces/PaymentHistory";
import {
  Document,
  View,
  Font,
  Image,
  StyleSheet,
  Text,
  Page,
  pdf,
} from "@react-pdf/renderer";

import localLogo from "../../../assets/images/invoiceLogo.png";

// -------- Fonts (ใช้ default) --------
Font.registerEmojiSource({
  format: "png",
  url: "https://twemoji.maxcdn.com/v/latest/72x72/",
});

// -------- Styles --------
const ROW_HEIGHT = 24;
const CAT_COL_WIDTH = "28%";
const FEAT_COL_WIDTH = "52%";
const PRICE_COL_WIDTH = "20%";

const styles = StyleSheet.create({
  // ===== Page =====
  page: {
    padding: 32,
    paddingBottom: 64,
    fontSize: 10,
    color: "#002C55",
  },

  // ===== Header / Logo =====
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 6,
  },
  logo: { height: 24 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "#0A2C55",
  },

  // ===== Address =====
  addrRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 8,
  },
  addrCol: { width: "48%" },
  addrLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0A2C55",
    marginBottom: 6,
  },
  addrBox: {},
  addrText: { lineHeight: "14px" },

  // ===== Payment method/ Status / Date / Order table =====
  infoTable: {
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  infoKeyCell: {
    width: "35%",
    padding: 4,
    backgroundColor: "#F6F6F6",
    borderRightWidth: 1,
    borderRightColor: "#CCCCCC",
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    display: "flex",
    justifyContent: "center",
  },
  infoValCell: {
    width: "65%",
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#CCCCCC",
    display: "flex",
    justifyContent: "center",
  },
  infoKeyText: { fontWeight: "bold", color: "#0A2C55", textAlign: "center" },
  infoValText: { color: "#0A2C55", textAlign: "center" },

  // ===== Table =====
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderColor: "#E5E7EB",
    marginTop: 0,
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
    backgroundColor: "#F6F6F6",
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
    backgroundColor: "#F6F6F6",
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
    backgroundColor: "#F6F6F6",
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
  mt12: { marginTop: 8 },
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
  // ==== line =====
  divider: { width: "100%", borderBottom: "1px solid #DFDFDF" },
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
      <View style={styles.headerRow}>
        <View style={styles.headerCellCat}>
          <Text style={[styles.headerText, styles.textCenter]}>Category</Text>
        </View>
        <View style={styles.headerCellFeat}>
          <Text
            style={[styles.headerText, styles.textLeft, { paddingLeft: 10 }]}
          >
            Feature
          </Text>
        </View>
        <View style={styles.headerCellPrice}>
          <Text style={[styles.headerText, styles.textCenter]}>
            Price (THB)
          </Text>
        </View>
      </View>
      {/* Body rows */}
      <View style={styles.row}>
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
              <Text style={[styles.textLeft, { paddingLeft: 10 }]}>
                {it.name}
              </Text>
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

const ReceiptDocument: React.FC<{ data: ReceiptDataType }> = ({ data }) => {
  const d = data;
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
            {d.logo?.receiptLogo ? (
              <Image src={localLogo} style={styles.logo} />
            ) : (
              <View />
            )}
            <View style={{ width: 120 }} />
          </View>
          <Text style={styles.title}>Receipt</Text>

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
          <View style={styles.divider}></View>
          {/* Payment method | Status | Date | Order no. */}
          {/* Title */}
          <Text style={[styles.mt12, styles.bold]}>Payment</Text>
          <View style={styles.infoTable}>
            <View style={styles.infoRow}>
              <View style={styles.infoKeyCell}>
                <Text style={styles.infoKeyText}>Payment method</Text>
              </View>
              <View style={styles.infoValCell}>
                <Text style={styles.infoValText}>
                  {d.tableOrder.paymentMethod}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoKeyCell}>
                <Text style={styles.infoKeyText}>status</Text>
              </View>
              <View style={styles.infoValCell}>
                <Text style={styles.infoValText}>{d.tableOrder.status}</Text>
              </View>
            </View>
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
                <Text style={styles.infoKeyText}>Order no</Text>
              </View>
              <View style={styles.infoValCell}>
                <Text style={styles.infoValText}>{d.tableOrder.orderNo}</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.mt12, styles.bold, { marginBottom: 8 }]}>
            Yearly Package price
          </Text>

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
                <View style={[styles.cell, { flex: 0.285 }]}>
                  <Text>{""}</Text>
                </View>
                <View style={[styles.cell, { flex: 0.53 }]}>
                  <Text style={[styles.bold, styles.textLeft]}>
                    VAT {d.tableFeatures.vatPercent}%
                  </Text>
                </View>
                <View style={[styles.cellLast, { flex: 0.205 }]}>
                  <Text style={[styles.bold, styles.textCenter]}>
                    {padPrice(d.tableFeatures.totalVat)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cell, { flex: 0.285 }]}>
                  <Text>{""}</Text>
                </View>
                <View style={[styles.cell, { flex: 0.53 }]}>
                  <Text style={[styles.bold, styles.textLeft]}>Subtotal</Text>
                </View>
                <View style={[styles.cellLast, { flex: 0.205 }]}>
                  <Text style={[styles.bold, styles.textCenter]}>
                    {padPrice(d.tableFeatures.totalPrice)}
                  </Text>
                </View>
              </View>
              <View style={styles.row}>
                <View style={[styles.cell, { flex: 0.285 }]}>
                  <Text>{""}</Text>
                </View>
                <View style={[styles.cell, { flex: 0.53 }]}>
                  <Text style={[styles.bold, styles.textLeft]}>Total</Text>
                </View>
                <View style={[styles.cellLast, { flex: 0.205 }]}>
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
          {d.logo?.receiptLogo ? (
            <Image src={localLogo} style={styles.logo} />
          ) : (
            <View />
          )}
          <View style={{ width: 120 }} />
        </View>
        <Text style={styles.title}>Receipt</Text>
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
        <View style={styles.divider}></View>
        {/* Payment method | Status | Date | Order no. */}
        <Text style={[styles.mt12, styles.bold]}>Payment</Text>
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <View style={styles.infoKeyCell}>
              <Text style={styles.infoKeyText}>Payment method</Text>
            </View>
            <View style={styles.infoValCell}>
              <Text style={styles.infoValText}>
                {d.tableOrder.paymentMethod}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoKeyCell}>
              <Text style={styles.infoKeyText}>Status</Text>
            </View>
            <View style={styles.infoValCell}>
              <Text style={styles.infoValText}>{d.tableOrder.status}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoKeyCell}>
              <Text style={styles.infoKeyText}>Date paid</Text>
            </View>
            <View style={styles.infoValCell}>
              <Text style={styles.infoValText}>
                {formatDate(d.tableOrder.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoKeyCell}>
              <Text style={styles.infoKeyText}>Order no</Text>
            </View>
            <View style={styles.infoValCell}>
              <Text style={styles.infoValText}>{d.tableOrder.orderNo}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.mt12, styles.bold, { marginBottom: 8 }]}>
          Yearly Package price
        </Text>

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
          {d.logo?.receiptLogo ? (
            <Image src={localLogo} style={styles.logo} />
          ) : (
            <View />
          )}
          <View style={{ width: 120 }} />
        </View>
        <Text style={styles.title}>Receipt</Text>

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

        <GroupBlock label="Optional features" items={opt} />

        <View wrap={false} minPresenceAhead={ROW_HEIGHT * 3 + 16}>
          <View style={styles.table}>
            <View style={styles.row}>
              <View style={[styles.cell, { flex: 0.285 }]}>
                <Text>{""}</Text>
              </View>
              <View style={[styles.cell, { flex: 0.53 }]}>
                <Text style={[styles.bold, styles.textLeft]}>
                  VAT {d.tableFeatures.vatPercent}%
                </Text>
              </View>
              <View style={[styles.cellLast, { flex: 0.205 }]}>
                <Text style={[styles.bold, styles.textCenter]}>
                  {padPrice(d.tableFeatures.totalVat)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.cell, { flex: 0.285 }]}>
                <Text>{""}</Text>
              </View>
              <View style={[styles.cell, { flex: 0.53 }]}>
                <Text style={[styles.bold, styles.textLeft]}>Subtotal</Text>
              </View>
              <View style={[styles.cellLast, { flex: 0.205 }]}>
                <Text style={[styles.bold, styles.textCenter]}>
                  {padPrice(d.tableFeatures.totalPrice)}
                </Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={[styles.cell, { flex: 0.285 }]}>
                <Text>{""}</Text>
              </View>
              <View style={[styles.cell, { flex: 0.53 }]}>
                <Text style={[styles.bold, styles.textLeft]}>Total</Text>
              </View>
              <View style={[styles.cellLast, { flex: 0.205 }]}>
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

export async function openReceiptPdf(data: ReceiptDataType) {
  const blob = await pdf(<ReceiptDocument data={data} />).toBlob();
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

export default ReceiptDocument;
