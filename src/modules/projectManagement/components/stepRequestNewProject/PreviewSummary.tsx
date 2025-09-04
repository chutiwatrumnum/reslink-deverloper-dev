import { Col, Row, Flex, Divider, Card, Empty, Typography } from "antd";
// Type
import type {
  FeaturesDataType,
  PreviewFeatureById,
} from "../../../../stores/interfaces/ProjectManage";
// CSS
import "../../styles/newProjectForm.css";
// API
import {
  useFeaturesBasePriceQuery,
  usePreviewFeatureByIdQuery,
} from "../../../../utils/queriesGroup/projectManagementQueries";
import { useEffect } from "react";

type PreviewSummaryPropsType = {
  checkedStandardValues: string[];
  checkedFeatureValues: string[];
  standardPackage: FeaturesDataType[];
  optionalFeature: any[];
  form?: any;
  previewData?: PreviewFeatureById;
};

const PreviewSummary = ({
  checkedStandardValues,
  checkedFeatureValues,
  standardPackage,
  optionalFeature,
  form,
}: PreviewSummaryPropsType) => {
  const { Text } = Typography;
  const { data: basedPriceData } = useFeaturesBasePriceQuery();

  const selectedStandardPackage = standardPackage.filter((item) => {
    if (!item?.id) return false;
    return checkedStandardValues.includes(String(item.id));
  });

  const selectedOptionalFeature = optionalFeature.filter((item) => {
    if (!item?.id) return false;
    return checkedFeatureValues.includes(String(item.id));
  });

  const getStandardPrice = () => {
    const standardItem = basedPriceData?.basePrice?.find(
      (item: any) => item.name === "Standard"
    );
    return standardItem ? Number(standardItem.price) : 50000;
  };

  const getVatRate = () => {
    const standardItem = basedPriceData?.basePrice?.find(
      (item: any) => item.name === "Standard"
    );
    return standardItem ? Number(standardItem.vatPercent) / 100 : 0.07;
  };

  useEffect(() => {
    if (!form) return;

    const standardBasedPrice =
      checkedStandardValues.length > 0 ? getStandardPrice() : 0;

    // Use displayPrice for adjusted pricing (bundle logic)
    const optionalBasedPrice = selectedOptionalFeature.reduce(
      (sum, i) => sum + Number(i.displayPrice ?? i.price ?? 0),
      0
    );

    const totalStandard = standardBasedPrice;
    const totalOptional = optionalBasedPrice;

    // Calculate subtotal
    const subtotal = standardBasedPrice + optionalBasedPrice;

    // Calculate VAT
    const vatRate = getVatRate();
    const vatPercent = vatRate * 100;
    const totalVat = subtotal * vatRate;
    const totalPriceWithVat = subtotal + totalVat;

    // ALL features selected
    const features = [...selectedStandardPackage, ...selectedOptionalFeature];

    form.setFieldsValue({
      standardBasePrice: Number(standardBasedPrice),
      optionalBasePrice: Number(optionalBasedPrice),
      totalStandard: Number(totalStandard),
      totalOptional: Number(totalOptional),
      totalPrice: Number(subtotal),
      vatPercent: Number(vatPercent),
      totalVat: Number(totalVat),
      totalPriceWithVat: Number(totalPriceWithVat),
      features: JSON.stringify(features),
    });
  }, [
    form,
    checkedStandardValues,
    checkedFeatureValues,
    selectedStandardPackage,
    selectedOptionalFeature,
    basedPriceData,
  ]);

  const standardBasePrice =
    checkedStandardValues.length > 0 ? getStandardPrice() : 0;

  // Use displayPrice for bundle-adjusted pricing
  const optionalBasePrice = selectedOptionalFeature.reduce(
    (sum, f) => sum + Number(f.displayPrice ?? f.price ?? 0),
    0
  );

  const subtotal = standardBasePrice + optionalBasePrice;
  const vatRate = getVatRate();
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  return (
    <Card style={{ marginBottom: 12 }}>
      <Typography.Title
        level={4}
        style={{ color: "var(--primary-color)", margin: 0 }}
      >
        Preview summary
      </Typography.Title>
      <Divider />
      {checkedStandardValues.length > 0 || checkedFeatureValues.length > 0 ? (
        <>
          {/* Standard Package preview */}
          {checkedStandardValues.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Row>
                <Col
                  span={24}
                  style={{
                    border: "1px solid #C6C8C9",
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    backgroundColor: "#A6CBFF",
                    padding: 6,
                  }}
                >
                  <Typography.Title
                    level={5}
                    style={{ color: "var(--primary-color)", margin: 0 }}
                  >
                    Standard features
                  </Typography.Title>
                </Col>
              </Row>
              <Row className="previewPackageRow">
                <Col span={12}>
                  {selectedStandardPackage.map((item, index) => (
                    <Flex
                      justify="space-between"
                      key={index}
                      className="previewPackageCol"
                    >
                      <Text style={{ color: "var(--primary-color)" }}>
                        {item?.name}
                      </Text>
                    </Flex>
                  ))}
                </Col>
                <Col span={12}>
                  <Flex
                    justify="center"
                    align="center"
                    style={{ width: "100%", height: "100%" }}
                  >
                    <Text style={{ color: "var(--primary-color)" }}>
                      {Number(standardBasePrice.toFixed(2)).toLocaleString()}.-
                    </Text>
                  </Flex>
                </Col>
              </Row>
            </div>
          )}

          {/* Optional Features preview - Updated to show bundle pricing */}
          {checkedFeatureValues.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Row>
                <Col
                  span={24}
                  style={{
                    border: "1px solid #C6C8C9",
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    backgroundColor: "#A6CBFF",
                    padding: 6,
                  }}
                >
                  <Typography.Title
                    level={5}
                    style={{ color: "var(--primary-color)", margin: 0 }}
                  >
                    Optional features
                  </Typography.Title>
                </Col>
              </Row>
              {selectedOptionalFeature.map((item, index) => {
                // Check if this feature is bundled (free due to another selection)
                const displayPrice = item.displayPrice ?? item.price ?? 0;
                const originalPrice = item.originalPrice ?? item.price ?? 0;
                const isFree = displayPrice === 0 && originalPrice > 0;

                return (
                  <Row
                    key={index}
                    style={{ borderInline: "1px solid #c6c8c9" }}
                  >
                    <Col span={12} className="previewPackageCol">
                      <Flex justify="space-between" align="center" gap={2}>
                        <div>
                          <Text style={{ color: "var(--primary-color)" }}>
                            {item?.name}
                          </Text>
                          {isFree && (
                            <div>
                              <Text
                                style={{
                                  fontSize: "12px",
                                  color: "var(--success-color)",
                                  fontWeight: 500,
                                }}
                              >
                                (Bundled)
                              </Text>
                            </div>
                          )}
                        </div>
                      </Flex>
                    </Col>
                    <Col
                      span={12}
                      style={{ borderBottom: "1px solid #c6c8c9" }}
                    >
                      <Flex
                        justify="center"
                        align="center"
                        style={{ width: "100%", height: "100%" }}
                      >
                        <Flex
                          justify="center"
                          align="center"
                          gap={2}
                          vertical={true}
                        >
                          {isFree && (
                            <Text
                              style={{
                                color: "#999",
                                textDecoration: "line-through",
                                fontSize: "12px",
                                display: "block",
                              }}
                            >
                              {Number(originalPrice).toLocaleString()}.-
                            </Text>
                          )}
                          <Text
                            style={{
                              color: isFree
                                ? "var(--success-color)"
                                : "var(--primary-color)",
                              fontWeight: isFree ? 600 : 400,
                            }}
                          >
                            {isFree
                              ? "0.-"
                              : `${Number(displayPrice).toLocaleString()}.-`}
                          </Text>
                        </Flex>
                      </Flex>
                    </Col>
                  </Row>
                );
              })}
            </div>
          )}

          {/* VAT */}
          {(checkedStandardValues.length > 0 ||
            checkedFeatureValues.length > 0) && (
            <Row
              style={{
                border: "1px solid #C6C8C9",
                marginTop: 12,
              }}
            >
              <Col
                span={12}
                style={{ borderRight: "1px solid #c6c8c9", padding: 6 }}
              >
                <Text>VAT {(vatRate * 100).toFixed(0)}%</Text>
              </Col>
              <Col span={12}>
                <Flex
                  justify="center"
                  align="center"
                  style={{ width: "100%", padding: 6 }}
                >
                  <Text style={{ color: "var(--primary-color)" }}>
                    {Number(vatAmount.toFixed(2)).toLocaleString()}.-
                  </Text>
                </Flex>
              </Col>
            </Row>
          )}

          {/* Savings indicator (optional) */}
          {selectedOptionalFeature.some(
            (item) =>
              (item.displayPrice ?? item.price ?? 0) <
              (item.originalPrice ?? item.price ?? 0)
          ) && (
            <Row
              style={{
                border: "1px solid var(--success-color)",
                marginTop: 8,
                backgroundColor: "#f6ffed",
              }}
            >
              <Col
                span={12}
                style={{
                  borderRight: "1px solid var(--success-color)",
                  padding: 6,
                }}
              >
                <Text
                  style={{ color: "var(--success-color)", fontWeight: 600 }}
                >
                  Bundle Savings
                </Text>
              </Col>
              <Col span={12}>
                <Flex
                  justify="center"
                  align="center"
                  style={{ width: "100%", padding: 6 }}
                >
                  <Text
                    style={{ color: "var(--success-color)", fontWeight: 600 }}
                  >
                    -
                    {Number(
                      selectedOptionalFeature
                        .reduce((savings, item) => {
                          const original =
                            item.originalPrice ?? item.price ?? 0;
                          const display = item.displayPrice ?? item.price ?? 0;
                          return savings + (original - display);
                        }, 0)
                        .toFixed(2)
                    ).toLocaleString()}
                    .-
                  </Text>
                </Flex>
              </Col>
            </Row>
          )}
        </>
      ) : (
        <Empty
          description={
            <Typography.Text type="secondary">
              select standard package/
              <br />
              optional feature
            </Typography.Text>
          }
        ></Empty>
      )}
      <Divider />
      <Flex justify="space-between" align="center" vertical={false}>
        <Typography.Title
          level={4}
          style={{ color: "var(--primary-color)", margin: 0 }}
        >
          Total
        </Typography.Title>
        <Typography.Title
          level={3}
          style={{ color: "var(--secondary-color)", margin: 0 }}
        >
          {total === 0 ? (
            <>00.00.-</>
          ) : (
            Number(total.toFixed(2)).toLocaleString() + ".-"
          )}
        </Typography.Title>
      </Flex>
    </Card>
  );
};

export default PreviewSummary;
