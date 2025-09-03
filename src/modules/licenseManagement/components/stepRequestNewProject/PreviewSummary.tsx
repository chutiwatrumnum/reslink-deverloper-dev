import { Col, Row, Flex, Divider, Card, Empty, Typography } from "antd";
// Type
import type { CheckboxOptionType } from "antd/es/checkbox/Group";
import "../../styles/newProjectForm.css";

type PreviewSummaryPropsType = {
  checkedStandardValues: string[];
  checkedFeatureValues: string[];
  standardPackage: CheckboxOptionType<string>[];
  optionalFeature: CheckboxOptionType<string>[];
};

const PreviewSummary = ({
  checkedStandardValues,
  checkedFeatureValues,
  standardPackage,
  optionalFeature,
}: PreviewSummaryPropsType) => {
  const standardPackagePrice = 50000; // Fixed price
  const optionalFeaturePrice = 10000; // Fixed price
  const vatRate = 0.07;

  const selectedStandardPackage = standardPackage.filter((item) =>
    checkedStandardValues.includes(item.value)
  );

  const selectedOptionalFeature = optionalFeature.filter((item) =>
    checkedFeatureValues.includes(item.value)
  );

  const standardTotal = standardPackagePrice;
  const optionalTotal = selectedOptionalFeature.length * optionalFeaturePrice;
  const subtotal = standardTotal + optionalTotal;
  const vatAmount = subtotal * vatRate;

  const total = checkedStandardValues.length === 0 ? 0 : subtotal + vatAmount;

  const { Text } = Typography;

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
                        {item.label}
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
                      {Number(standardPackagePrice.toFixed(2)).toLocaleString()}
                      .-
                    </Text>
                  </Flex>
                </Col>
              </Row>
            </div>
          )}

          {/* Optional Features preview */}
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
              {selectedOptionalFeature.map((item, index) => (
                <Row key={index} style={{ borderInline: "1px solid #c6c8c9" }}>
                  <Col span={12} className="previewPackageCol">
                    <Flex justify="space-between">
                      <Text style={{ color: "var(--primary-color)" }}>
                        {item.label}
                      </Text>
                    </Flex>
                  </Col>
                  <Col span={12} style={{ borderBottom: "1px solid #c6c8c9" }}>
                    <Flex
                      justify="center"
                      align="center"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Text style={{ color: "var(--primary-color)" }}>
                        {Number(
                          optionalFeaturePrice.toFixed(2)
                        ).toLocaleString()}
                        .-
                      </Text>
                    </Flex>
                  </Col>
                </Row>
              ))}
            </div>
          )}

          {/* VAT 7% */}
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
                <Text>VAT 7%</Text>
              </Col>
              <Col span={12} style={{ padding: 6 }}>
                <Flex justify="center" align="center">
                  <Text style={{ color: "var(--primary-color)" }}>
                    {Number(vatAmount.toFixed(2)).toLocaleString()}.-
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
            <>0.-</>
          ) : (
            Number(total.toFixed(2)).toLocaleString() + ".-"
          )}
        </Typography.Title>
      </Flex>
    </Card>
  );
};

export default PreviewSummary;
