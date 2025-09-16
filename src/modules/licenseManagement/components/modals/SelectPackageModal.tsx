// Imports
import { useState, useEffect, ReactNode, useMemo } from "react";
import ConfirmModal from "../../../../components/common/ConfirmModal";
import {
  Col,
  Form,
  Row,
  Button,
  Card,
  Divider,
  Checkbox,
  Flex,
  Typography,
  message,
} from "antd";
import StepBar from "../stepRequestNewProject/StepBar";
import StepModal from "../stepRequestNewProject/StepModal";
import PreviewSummary from "../stepRequestNewProject/PreviewSummary";
import UploadImagePayment from "../UploadImagePayment";
import SmallButton from "../../../../components/common/SmallButton";
import { openInvoicePdf } from "../InvoicePDF";
import "../../styles/stepModalCreate.css";
import "../../styles/newProjectForm.css";
import {
  FeaturesDataType,
  StepStatus,
  CreateInvoicePackageType,
  PaymentUpdate,
  InvoiceData,
} from "../../../../stores/interfaces/ProjectManage";
import successPaymentImage from "../../../../assets/images/success-payment.png";
import { DeleteOutlined } from "@ant-design/icons";
import { useEditProjectManagementPaymentMutation } from "../../../../utils/mutationsGroup/projectManagement";
import { postCreatePackageInvoiceMutation } from "../../../../utils/mutationsGroup/licenseMutations";
import { useFeaturesAndProjectByIdQuery } from "../../../../utils/queriesGroup/projectManagementQueries";
import { getLicenseFeaturesDashboardQuery } from "../../../../utils/queriesGroup/licenseQueries";

// Types
type SelectPackageModalPropsType = {
  isSelectPackageModalOpen: boolean;
  onCancel: () => void;
  onNextStep: () => void;
  licenseId?: string | null;
  projectId?: string;
  currentStep: number;
};
type stepsType = {
  stepTitle: string;
  title: string;
  description: string;
  content: ReactNode;
};

// Component: SelectPackageModal
const SelectPackageModal = ({
  onCancel,
  onNextStep,
  isSelectPackageModalOpen,
  licenseId: useLicenseId,
  projectId,
  currentStep,
}: SelectPackageModalPropsType) => {
  // Forms
  const [packageForm] = Form.useForm();
  const [payForm] = Form.useForm();

  // State
  const [open, setOpen] = useState<boolean>(false);
  const [previewProofPayment, setPreviewProofPayment] = useState("");
  const [isSuccessPayment, setIsSuccessPayment] = useState<boolean>(false);
  const [checkedStandardValues, setCheckedStandardValues] = useState<string[]>(
    []
  );
  const [checkedFeatureValues, setCheckedFeatureValues] = useState<string[]>(
    []
  );
  const [licenseId, setLicenseId] = useState<string | null>(
    useLicenseId || null
  );

  // Queries & Mutations
  const { data: featuresData } = getLicenseFeaturesDashboardQuery();
  const createPackageInvoice = postCreatePackageInvoiceMutation();
  const updatePayment = useEditProjectManagementPaymentMutation();
  const { data: featureAndBankPreview } = useFeaturesAndProjectByIdQuery(
    licenseId!
  );
  console.log(featureAndBankPreview);

  // Derived data
  const { Text } = Typography;
  const bankName = featureAndBankPreview?.bank?.bankName || "";
  const accountNo = featureAndBankPreview?.bank?.accountNo || "";
  const accountName = featureAndBankPreview?.bank?.accountName || "";
  const allStandardIds = useMemo(
    () => (featuresData?.standard ?? []).map((it: any) => String(it.id)),
    [featuresData]
  );
  const optionalList = useMemo(
    () =>
      (featuresData?.optional ?? []).map((f: any) => ({
        id: String(f.id),
        name: f.name,
        price: Number(f.price ?? 0),
        featureBundles: f.featureBundles || [], // [{ featuresId, bundleFeaturesId }]
      })),
    [featuresData?.optional]
  );
  const isAllSelected = checkedStandardValues.length === allStandardIds.length;

  // Effects
  useEffect(() => {
    setOpen(isSelectPackageModalOpen);
    if (isSelectPackageModalOpen) {
      resetAllStates();
      setLicenseId(useLicenseId || null);
    }
  }, [isSelectPackageModalOpen, useLicenseId]);

  useEffect(() => {
    if (!!licenseId && !!featureAndBankPreview?.features) {
      try {
        const standardFeatures = featureAndBankPreview.features.standard || [];
        const optionalFeatures = featureAndBankPreview.features.optional || [];

        // selected standard features
        const selectedStandardIds = standardFeatures
          .filter((item: any) => item.isUserSelect === true)
          .map((item: any) => String(item.feature?.id || item.id));

        // selected optional features
        const selectedOptionalIds = optionalFeatures
          .filter((item: any) => item.isUserSelect === true)
          .map((item: any) => String(item.feature?.id || item.id));

        setCheckedStandardValues(selectedStandardIds);
        setCheckedFeatureValues(selectedOptionalIds);

        // Update form values
        packageForm.setFieldsValue({
          standardPackage: selectedStandardIds,
          optionalFeature: selectedOptionalIds,
        });
      } catch (error) {
        console.error("Error loading existing features:", error);
      }
    }
  }, [licenseId, featureAndBankPreview, packageForm]);

  // Helpers
  const resetAllStates = () => {
    packageForm.resetFields();
    payForm.resetFields();
    setCheckedStandardValues([]);
    setCheckedFeatureValues([]);
    setIsSuccessPayment(false);
    setPreviewProofPayment("");
    setLicenseId(null);
  };
  const getStepStatus = (index: number): StepStatus => {
    if (index + 1 < currentStep) return "completed";
    if (index + 1 === currentStep) return "active";
    return "pending";
  };

  // Handlers - Standard
  const onToggleSelectAllStandard = (value: boolean) => {
    if (value) {
      setCheckedStandardValues(allStandardIds);
      packageForm.setFieldsValue({ standardPackage: allStandardIds });
    } else {
      setCheckedStandardValues([]);
      packageForm.setFieldsValue({ standardPackage: [] });
    }
  };

  const OPTIONAL_LIMIT = 8;

  const handleOptionalChange = (values: string[]) => {
    // ทำ id ให้เป็น string เสมอ
    const input = Array.from(new Set(values.map(String)));

    // ----- บังคับลำดับชั้น parent bundle (เหมือน A) -----
    const filteredByParent = input.filter((id) => {
      const feature = optionalList.find((f: any) => f.id === id);
      if (!feature) return true;

      // หา parent ของ id นี้ จากทุกฟีเจอร์ที่มี bundle pointing มาหา id นี้
      const parentBundles = optionalList.flatMap(
        (f: any) =>
          f.featureBundles?.filter(
            (b: any) => String(b.bundleFeaturesId) === id
          ) || []
      );
      const requiredParents = parentBundles.map((b: any) =>
        String(b.featuresId)
      );

      return (
        requiredParents.length === 0 ||
        requiredParents.some((pid: string) => input.includes(pid))
      );
    });

    // ----- จำกัดไม่เกิน 8 รายการ -----
    let next = filteredByParent;
    if (filteredByParent.length > OPTIONAL_LIMIT) {
      message.warning(
        `You can select up to ${OPTIONAL_LIMIT} optional features.`
      );
      next = filteredByParent.slice(0, OPTIONAL_LIMIT);
    }

    setCheckedFeatureValues(next);
    packageForm.setFieldsValue({ optionalFeature: next });

    // ถ้าในระบบคุณต้องเก็บ features ไว้ใน hidden field (เช่น JSON) ให้ตั้งค่าที่นี่ด้วย
    // ตัวอย่าง: เก็บเป็น array ของ id อย่างเดียว
    packageForm.setFieldsValue({ features: next });
  };

  // Actions - Invoice
  const onCreateInvoicePackage = async (data: InvoiceData) => {
    try {
      await openInvoicePdf(data);
      onNextStep();
    } catch (error) {
      console.log("Error create invoice", error);
    }
  };
  const onFinishSelectedPackage = async (values: CreateInvoicePackageType) => {
    try {
      if (!projectId) {
        message.error("Project ID is missing. Please try again.");
        return;
      }

      // Parse features from JSON string
      let parsedFeatures: any[] = [];
      if (typeof values.features === "string") {
        try {
          parsedFeatures = JSON.parse(values.features);
        } catch (e) {
          console.error("Error parsing features:", e);
          parsedFeatures = [];
        }
      } else if (Array.isArray(values.features)) {
        parsedFeatures = values.features;
      }

      const vat = 7;
      const payload: CreateInvoicePackageType = {
        projectId: projectId, // mock project
        standardBasePrice: Number(values.standardBasePrice || 0),
        optionalBasePrice: Number(values.optionalBasePrice || 0),
        totalStandard: Number(values.totalStandard || 0),
        totalOptional: Number(values.totalOptional || 0),
        vatPercent: Number(values.vatPercent?.toFixed(0) || vat.toFixed(0)),
        totalVat: Number(values.totalVat || 0),
        totalPrice: Number(values.totalPrice || 0),
        totalPriceWithVat: Number(values.totalPriceWithVat || 0),
        features: parsedFeatures,
      };
      // console.log("Payload result:", payload);
      await createPackageInvoice.mutateAsync(payload).then(async (res) => {
        console.log("Create invoice response:", res);

        await onCreateInvoicePackage(res.data.result.pdf);
        const licenseId = res.data?.result?.licenseId;
        setLicenseId(licenseId);
      });
      onNextStep();
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      message.error(
        error.response.data.message ??
          "Failed to create invoice. Please try again."
      );
    }
  };

  // Handlers - Payment
  const handleDeleteProofPayment = () => {
    setPreviewProofPayment("");
    payForm.resetFields(["file"]);
  };
  const onFinishPayForm = async (values: PaymentUpdate) => {
    try {
      if (!licenseId) {
        message.error("License ID is missing, please try again");
        return;
      }
      const payload: PaymentUpdate = { id: licenseId, file: values.file };
      await updatePayment
        .mutateAsync({ id: licenseId, payload })
        .then((res) => {
          console.log("update payment respond: ", res);
        });
      setIsSuccessPayment(true);
    } catch (error) {
      message.error("Failed to submit payment, please try again.");
    }
  };

  // UI - Stepper
  const Stepper = () => (
    <div className="stepperStyle">
      {steps.map((step, index) => (
        <StepBar
          key={index}
          title={step.stepTitle}
          status={getStepStatus(index)}
        />
      ))}
    </div>
  );

  // UI - PackageForm
  const PackageForm = () => (
    <Form
      form={packageForm}
      name="packageForm"
      autoComplete="off"
      layout="vertical"
      onFinish={onFinishSelectedPackage}
    >
      {/* Hidden fields */}
      <Form.Item name="standardBasePrice" hidden>
        <input />
      </Form.Item>
      <Form.Item name="optionalBasePrice" hidden>
        <input />
      </Form.Item>
      <Form.Item name="totalStandard" hidden>
        <input />
      </Form.Item>
      <Form.Item name="totalOptional" hidden>
        <input />
      </Form.Item>
      <Form.Item name="totalPrice" hidden>
        <input />
      </Form.Item>
      <Form.Item name="totalVat" hidden>
        <input />
      </Form.Item>
      <Form.Item name="vatPercent" hidden initialValue={7}>
        <input />
      </Form.Item>
      <Form.Item name="totalPriceWithVat" hidden>
        <input />
      </Form.Item>
      <Form.Item name="features" hidden>
        <input />
      </Form.Item>

      <Row gutter={20} style={{ paddingInline: "12px" }}>
        <Col span={14}>
          <Card style={{ marginBottom: 12 }}>
            <Typography.Title
              level={4}
              style={{ color: "var(--primary-color)" }}
            >
              Standard package
            </Typography.Title>
            <Text type="secondary">
              This is the standard package included in the base price. You can
              also select additional optional features in the box below.
            </Text>
            {/* Select-all checkbox */}
            <Flex
              justify="space-between"
              align="center"
              style={{ marginTop: 16, marginBottom: 16 }}
            >
              <Checkbox
                checked={isAllSelected}
                onChange={(e) => onToggleSelectAllStandard(e.target.checked)}
              >
                Buy or Renew Standard Package
              </Checkbox>
            </Flex>
            <Form.Item
              name="standardPackage"
              style={{ marginTop: 24 }}
              initialValue={checkedStandardValues}
            >
              <Checkbox.Group
                value={checkedStandardValues}
                // onChange={handleStandardChange}
              >
                <Row gutter={10}>
                  {featuresData?.standard?.map(
                    (item: FeaturesDataType, index: number) => {
                      const isChecked = checkedStandardValues.includes(
                        item.id as string
                      );
                      return (
                        <Col span={12} key={index}>
                          <Checkbox
                            disabled={item.isDefault === true}
                            value={item.id}
                            className="packageBoxCustom"
                            style={{
                              borderColor: isChecked
                                ? "var(--secondary-color)"
                                : "#EBEBEB",
                            }}
                          >
                            {item.name}
                          </Checkbox>
                        </Col>
                      );
                    }
                  )}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Card>

          <Card style={{ marginBottom: 12 }}>
            <Typography.Title
              level={4}
              style={{ color: "var(--primary-color)" }}
            >
              Optional features
            </Typography.Title>
            <Text type="secondary">
              You can add up to 8 optional features to enhance your experience.
            </Text>
            <Form.Item name="optionalFeature" style={{ marginTop: 24 }}>
              <Checkbox.Group
                value={checkedFeatureValues}
                onChange={handleOptionalChange}
                className="optionalFeature"
              >
                <Row gutter={10}>
                  {optionalList.map((item: any, index: any) => {
                    // หา parent ที่อ้างถึง item.id
                    const parentBundles = optionalList.flatMap(
                      (f: any) =>
                        f.featureBundles?.filter(
                          (b: any) => String(b.bundleFeaturesId) === item.id
                        ) || []
                    );
                    const requiredParents = parentBundles.map((b: any) =>
                      String(b.featuresId)
                    );
                    const isParentChecked =
                      requiredParents.length === 0 ||
                      requiredParents.some((pid: any) =>
                        checkedFeatureValues.includes(pid)
                      );

                    const isChecked = checkedFeatureValues.includes(item.id);

                    return (
                      <Col span={12} key={index}>
                        <Checkbox
                          value={item.id}
                          disabled={!isParentChecked}
                          className="packageBoxCustom"
                          style={{
                            borderColor: isChecked
                              ? "var(--secondary-color)"
                              : "#EBEBEB",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>{item.name}</span>
                            <span
                              style={{
                                color: isChecked
                                  ? "var(--success-color)"
                                  : "#3f3f3f",
                                fontWeight: isChecked ? 600 : 300,
                              }}
                            >
                              {item.price.toLocaleString()}
                            </span>
                          </div>
                        </Checkbox>
                      </Col>
                    );
                  })}
                </Row>
              </Checkbox.Group>
            </Form.Item>
          </Card>
        </Col>

        <Col span={10}>
          <PreviewSummary
            form={packageForm}
            checkedStandardValues={checkedStandardValues}
            checkedFeatureValues={checkedFeatureValues}
            standardPackage={featuresData?.standard || []}
            optionalFeature={featuresData?.optional || []}
          />
        </Col>
      </Row>

      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Flex justify="center" align="center">
            <Form.Item>
              <Button
                type="text"
                size="large"
                onClick={onSkipPackageForm}
                style={{
                  width: 200,
                  borderColor: "var(--secondary-color)",
                  marginRight: 12,
                }}
              >
                Skip
              </Button>
              <SmallButton
                form={packageForm}
                message="Create invoice"
                className="saveButton"
              />
            </Form.Item>
          </Flex>
        </Col>
      </Row>
    </Form>
  );

  // UI - PayForm
  const PayForm = () => (
    <Form
      form={payForm}
      name="payForm"
      autoComplete="off"
      layout="vertical"
      onFinish={onFinishPayForm}
    >
      <Row gutter={20} style={{ paddingInline: "12px" }}>
        <Col span={14}>
          <Card style={{ marginBottom: 12 }}>
            <Typography.Title
              level={4}
              style={{ color: "var(--primary-color)" }}
            >
              Bank transfer
            </Typography.Title>
            <Divider />
            <Flex vertical={true} style={{ color: "var(--primary-color)" }}>
              <p>
                Bank: <b>{bankName}</b>
              </p>
              <p>
                Account no.: <b>{accountNo}</b>
              </p>
              <p>
                Account name: <b>{accountName}</b>
              </p>
            </Flex>
            <Divider />
            <Typography.Title
              level={5}
              style={{ color: "var(--primary-color)", marginBottom: 12 }}
            >
              Upload proof of payment
            </Typography.Title>
            <Form.Item
              name="file"
              rules={[
                { required: true, message: "Please upload proof of payment!" },
              ]}
            >
              <UploadImagePayment
                onChange={(url) => {
                  setPreviewProofPayment(url);
                  payForm.setFieldValue("file", url);
                }}
                image={previewProofPayment}
                height={280}
              />
              {previewProofPayment && (
                <Flex justify="end" style={{ marginTop: 4 }}>
                  <Button
                    type="text"
                    size="middle"
                    icon={
                      <DeleteOutlined
                        style={{ color: "var(--danger-color)" }}
                      />
                    }
                    onClick={handleDeleteProofPayment}
                    style={{ color: "var(--danger-color)" }}
                  >
                    Change image
                  </Button>
                </Flex>
              )}
            </Form.Item>
          </Card>
        </Col>

        <Col span={10}>
          <PreviewSummary
            form={packageForm}
            checkedStandardValues={checkedStandardValues}
            checkedFeatureValues={checkedFeatureValues}
            standardPackage={featuresData?.standard || []}
            optionalFeature={featuresData?.optional || []}
            licenseId={licenseId}
          />
        </Col>
      </Row>

      <Row style={{ paddingTop: 12 }}>
        <Col span={24}>
          <Flex gap={10} justify="center" align="center">
            <Form.Item>
              <Button
                type="text"
                size="large"
                style={{
                  width: 200,
                  borderColor: "var(--secondary-color)",
                  marginRight: 12,
                }}
                onClick={onSkipPaymentForm}
              >
                Skip
              </Button>
              <SmallButton
                form={payForm}
                message="Submit"
                className="saveButton"
              />
            </Form.Item>
          </Flex>
        </Col>
      </Row>
    </Form>
  );

  // UI - PaySuccessPage
  const PaySuccessPage = () => (
    <Flex
      vertical
      justify="center"
      align="center"
      style={{ padding: 24, marginBottom: 48 }}
    >
      <Flex
        style={{
          width: 200,
          height: 200,
          padding: 24,
          borderRadius: "50%",
          backgroundColor: "#D3F8D6",
          marginBottom: 24,
        }}
        justify="center"
        align="center"
      >
        <img src={successPaymentImage} style={{ width: "80%" }} />
      </Flex>
      <Typography.Title level={4} style={{ color: "#002C55" }}>
        Thank you for your payment!
      </Typography.Title>
      <Flex
        vertical
        justify="center"
        align="center"
        style={{ marginBottom: 24 }}
      >
        <Text style={{ color: "#002C55" }}>
          Your payment slip has been submitted.
        </Text>
        <Text style={{ color: "#002C55" }}>
          We{"'"}re verifying your payment and will notify you once your license
          is activated.
        </Text>
        <Text style={{ color: "#002C55" }}>
          Verification usually takes 1–2 business days during working time.
        </Text>
      </Flex>
      <Button
        size="large"
        type="primary"
        style={{ width: 250 }}
        onClick={onCancel}
      >
        Go to dashboard
      </Button>
    </Flex>
  );

  // UI - Payment step switch
  const PaymentStep = () =>
    isSuccessPayment ? <PaySuccessPage /> : <PayForm />;

  // Steps config
  const steps: stepsType[] = [
    {
      stepTitle: "Select package",
      title:
        "Start with our standard package & customize with optional features",
      description:
        "Start with our standard package and add up to 8 optional features to suit your needs. Pricing will adjust based on your selection.",
      content: <PackageForm />,
    },
    {
      stepTitle: "Pay",
      title: isSuccessPayment ? "" : "Complete your payment",
      description: isSuccessPayment
        ? ""
        : "Review your selected features and enter your payment details to finish your registration.",
      content: <PaymentStep />,
    },
  ];

  // Handlers - Modal close/skip
  const onModalClose = () => {
    resetAllStates();
    onCancel();
  };

  const onSkipPackageForm = async () => {
    ConfirmModal({
      title: "You want to exit the Select package.",
      message: "Do you want to exit the Select package?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        resetAllStates();
        onModalClose();
      },
    });
  };

  const onSkipPaymentForm = async () => {
    ConfirmModal({
      title: "You want to exit complete your payment.",
      message: "Do you want to exit Complete your payment?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        resetAllStates();
        onModalClose();
      },
    });
  };

  // Render
  return (
    <StepModal isOpen={open} header={<Stepper />} onClose={onModalClose}>
      <Row style={{ marginTop: 12, marginBottom: 12 }}>
        <Col span={24} style={{ justifyItems: "center" }}>
          <h4 style={{ color: "var(--primary-color)", fontSize: "18px" }}>
            {steps[currentStep - 1]?.title}
          </h4>
          <p style={{ color: "var(--secondary-color)" }}>
            {steps[currentStep - 1]?.description}
          </p>
        </Col>
      </Row>
      {steps[currentStep - 1]?.content}
    </StepModal>
  );
};

// Export
export default SelectPackageModal;
