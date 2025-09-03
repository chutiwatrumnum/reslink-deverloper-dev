import { useState, useEffect, ReactNode } from "react";

// Components
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
  Upload,
  Spin,
  message,
  Typography,
} from "antd";
import StepBar from "../stepRequestNewProject/StepBar";
import StepModal from "../stepRequestNewProject/StepModal";
import PreviewSummary from "../stepRequestNewProject/PreviewSummary";

// CSS
import "../../styles/stepModalCreate.css";
import "../../styles/newProjectForm.css";

// Types
import { StepStatus } from "../../../../stores/interfaces/ProjectManage";
import type { CheckboxOptionType, UploadProps } from "antd";

//Image
import successPaymentImage from "../../../../assets/images/success-payment.png";

//Icons
import { InboxOutlined } from "@ant-design/icons";

// Data & APIs
import { requiredRule } from "../../../../configs/inputRule";

type SelectPackageModalPropsType = {
  isSelectPackageModalOpen: boolean;
  onCancel: () => void;
};

type stepsType = {
  stepTitle: string;
  title: string;
  description: string;
  content: ReactNode;
};

const SelectPackageModal = ({
  onCancel,
  isSelectPackageModalOpen,
}: SelectPackageModalPropsType) => {
  const [projectForm] = Form.useForm();
  const [packageForm] = Form.useForm();
  const [payForm] = Form.useForm();

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(isSelectPackageModalOpen);
  }, [isSelectPackageModalOpen]);

  // Step status management
  const [currentStep, setCurrentStep] = useState(1);

  const getStepStatus = (index: number): StepStatus => {
    if (index + 1 < currentStep) return "completed";
    if (index + 1 === currentStep) return "active";
    return "pending";
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex + 1 <= currentStep) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const Stepper = () => {
    return (
      <div className="stepperStyle">
        {steps.map((step, index) => (
          <StepBar
            key={index}
            title={step.stepTitle}
            status={getStepStatus(index)}
            onClick={() => handleStepClick(index)}
          />
        ))}
      </div>
    );
  };

  // Configuring Ant Design components
  const { Dragger } = Upload;
  const { Text } = Typography;

  // Upload slip in step 3: Pay
  const [previewPoofPayment, setPreviewProofPayment] = useState<string | null>(
    null
  );

  const props: UploadProps = {
    name: "file",
    multiple: false,
    showUploadList: false, // 👈 hide default list
    action: "https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload",
    beforeUpload: (file) => {
      // create preview immediately
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewProofPayment(reader.result as string);
      };
      return true; // continue upload
    },
    onChange(info) {
      const { status } = info.file;
      if (status === "done") {
        message.success(`${info.file.name} uploaded successfully`);
      } else if (status === "error") {
        message.error(`${info.file.name} upload failed`);
      }
    },
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State for checkbox standard package and optional feature values
  const [checkedStandardValues, setCheckedStandardValues] = useState<string[]>(
    []
  );
  const [checkedFeatureValues, setCheckedFeatureValues] = useState<string[]>(
    []
  );

  // Standard package and optional features
  const standardPackage: CheckboxOptionType<string>[] = [
    { label: "Contact list", value: "contactList" },
    { label: "Document form", value: "documentForm" },
    { label: "Events", value: "events" },
    { label: "Fixing report", value: "fixingReport" },
    { label: "Home automation", value: "homeAutomation" },
    { label: "Left home with guard", value: "leftHomeWithGuard" },
    { label: "Live chat", value: "liveChat" },
    { label: "Maintenance guide", value: "maintenanceGuide" },
    { label: "My pets", value: "myPets" },
    { label: "News and announcement", value: "newsAndAnnouncement" },
    { label: "Notifications", value: "notifications" },
    { label: "Parcel alert", value: "parcelAlert" },
    { label: "Services", value: "services" },
    { label: "SOS", value: "sos" },
    { label: "Warranty tracking", value: "warrantyTracking" },
    { label: "Weather forecast", value: "weatherForecast" },
  ];
  const optionalFeature: CheckboxOptionType<string>[] = [
    { label: "Bill and payment", value: "billAndPayment" },
    { label: "Privilege", value: "privilege" },
    { label: "Facility booking", value: "facilityBooking" },
    { label: "Vehicle management", value: "vehicleManagement" },
    { label: "Facility fixing report", value: "facilityFixingReport" },
    { label: "Visitor management", value: "visitorManagement" },
    { label: "People counting", value: "peopleCounting" },
    { label: "E-stamp", value: "eStamp" },
  ];

  //Content Step 1: Select Package
  const PackageForm = () => {
    return (
      <Form
        form={packageForm}
        name="packageForm"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onSelectPackageFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <Row gutter={20} style={{ paddingInline: "12px" }}>
          <Col span={14}>
            <Row>
              <Col span={24}>
                {/* Standard Package Card */}
                <Card style={{ marginBottom: 12 }}>
                  <Typography.Title
                    level={4}
                    style={{ color: "var(--primary-color)" }}
                  >
                    Standard package
                  </Typography.Title>
                  <Text type="secondary">
                    This is the standard package included in the base price. You
                    can also select additional optional features in the box
                    below.
                  </Text>
                  <Form.Item name="standardPackage" style={{ marginTop: 24 }}>
                    <Checkbox.Group
                      style={{ width: "100%" }}
                      value={checkedStandardValues}
                      onChange={setCheckedStandardValues}
                    >
                      <Row gutter={10}>
                        {standardPackage.map((item, index) => (
                          <Col span={12} key={index}>
                            <Checkbox
                              value={item.value}
                              className="packageBoxCustom"
                              style={{
                                borderColor: checkedStandardValues.includes(
                                  item.value
                                )
                                  ? "var(--secondary-color)"
                                  : "#EBEBEB",
                              }}
                            >
                              {item.label}
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Card>
                {/* Optional Features Card */}
                <Card style={{ marginBottom: 12 }}>
                  <Typography.Title
                    level={4}
                    style={{ color: "var(--primary-color)" }}
                  >
                    Optional features
                  </Typography.Title>
                  <Text type="secondary">
                    You can add up to 8 optional features to enhance your
                    experience.
                  </Text>
                  <Form.Item name="optionalFeature" style={{ marginTop: 24 }}>
                    <Checkbox.Group
                      style={{ width: "100%" }}
                      value={checkedFeatureValues}
                      onChange={setCheckedFeatureValues}
                    >
                      <Row gutter={10}>
                        {optionalFeature.map((item, index) => (
                          <Col span={12} key={index}>
                            <Checkbox
                              value={item.value}
                              className="packageBoxCustom"
                              style={{
                                borderColor: checkedFeatureValues.includes(
                                  item.value
                                )
                                  ? "var(--secondary-color)"
                                  : "#EBEBEB",
                              }}
                            >
                              {item.label}
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={10}>
            <Row>
              <Col span={24}>
                {/* Preview Summary Card */}
                <PreviewSummary
                  checkedStandardValues={checkedStandardValues}
                  checkedFeatureValues={checkedFeatureValues}
                  standardPackage={standardPackage}
                  optionalFeature={optionalFeature}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ paddingBlock: 12 }}>
          <Col span={24}>
            <Flex gap={10} justify="center" align="center">
              <Button
                type="text"
                size="large"
                onClick={onSkipPackageForm}
                style={{ width: 200, borderColor: "var(--secondary-color)" }}
              >
                Skip
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ width: 200 }}
                disabled={
                  (checkedStandardValues.length ||
                    checkedFeatureValues.length) === 0 || isLoading
                }
                icon={isLoading ? <Spin size="small" /> : <></>}
              >
                {(checkedStandardValues.length ||
                  checkedFeatureValues.length) === 0
                  ? "Next"
                  : "Create invoice"}
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    );
  };
  // Content Step 2: Pay
  const PayForm = () => {
    return (
      <Form
        form={payForm}
        name="payForm"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        // onFinish={onPayFinish}
        // onFinishFailed={() => {
        //   console.log("FINISHED FAILED");
        // }}
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
                  Bank: <b>Kasikorn Bank</b>
                </p>
                <p>
                  Account no.: <b>1234567890</b>
                </p>
                <p>
                  Account name: <b>Lifestyletechnogies</b>
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
                name="proofPayment"
                valuePropName="file"
                getValueFromEvent={(e) => (e?.file ? e.file : null)}
                rules={requiredRule}
              >
                <Dragger {...props} accept=".png,.jpg,.jpeg" height={400}>
                  <Flex
                    style={{ width: "100%" }}
                    justify="center"
                    align="center"
                    vertical={true}
                  >
                    {!previewPoofPayment ? (
                      <div style={{ width: "60%" }}>
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <Typography.Title level={5}>
                          Click or drag file to this area to upload
                        </Typography.Title>
                        <Flex vertical={true} style={{ margin: 0 }}>
                          <Text type="secondary">
                            Support for a single or bulk upload.
                          </Text>
                          <Text type="secondary">
                            Strictly prohibited from uploading company data or
                            other banned files.
                          </Text>
                        </Flex>
                      </div>
                    ) : (
                      <img
                        src={previewPoofPayment}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: 350,
                          objectFit: "contain",
                        }}
                      />
                    )}
                  </Flex>
                </Dragger>
              </Form.Item>
            </Card>
          </Col>
          <Col span={10}>
            <PreviewSummary
              checkedStandardValues={checkedStandardValues}
              checkedFeatureValues={checkedFeatureValues}
              standardPackage={standardPackage}
              optionalFeature={optionalFeature}
            />
          </Col>
        </Row>
        <Row style={{ paddingBlock: 12 }}>
          <Col span={24}>
            <Flex gap={10} justify="center" align="center">
              <Button
                type="text"
                size="large"
                style={{ width: 200, borderColor: "var(--secondary-color)" }}
                onClick={onSkipPaymentForm}
              >
                Skip
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{ width: 200 }}
                disabled={isLoading}
                icon={isLoading ? <Spin size="small" /> : <></>}
              >
                Submit
              </Button>
            </Flex>
          </Col>
        </Row>
      </Form>
    );
  };

  // Content display success payment
  const PaySuccessPage = () => {
    return (
      <Flex
        vertical={true}
        justify="center"
        align="center"
        style={{ padding: 24 }}
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
          vertical={true}
          justify="center"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Text style={{ color: "#002C55" }}>
            Your payment slip has been submitted.
          </Text>
          <Text style={{ color: "#002C55" }}>
            We{`’`}re verifying your payment and will notify you once your
            license is activated.
          </Text>
          <Text style={{ color: "#002C55" }}>
            Verification usually takes 1{`–`}2 business days during working
            time.
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
  };

  const [isSuccessPayment, setIsSuccessPayment] = useState<boolean>(false);

  const PaymentStep = () => {
    return isSuccessPayment ? <PaySuccessPage /> : <PayForm />;
  };

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

  const onModalClose = () => {
    projectForm.resetFields();
    packageForm.resetFields();
    payForm.resetFields();
    onCancel();
  };

  const onSavePackageForm = async (values: any) => {
    setIsLoading(true);
    try {
      console.log("Saving package: ", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setCurrentStep(Math.min(steps.length, currentStep + 1));
    } catch (error) {
      console.error("Error saving package:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectPackageFinish = (values: any) => {
    console.log("Form values:", values);
    onSavePackageForm(values);
    onCreateInvoicePackage();
  };

  const onSavePayForm = async (values: any) => {
    setIsLoading(true);
    try {
      console.log("Saving pay: ", values);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setCurrentStep(Math.min(steps.length, currentStep + 1));
      setIsSuccessPayment(true);
    } catch (error) {
      console.error("Error saving pay:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPayFinish = (values: any) => {
    console.log("Form values:", values);
    onSavePayForm(values);
  };

  const onCreateInvoicePackage = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to generate invoice/PDF
      await new Promise((resolve) => setTimeout(resolve, 4000));
      // Mock PDF URL
      const pdfUrl =
        "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      window.open(pdfUrl, "_blank");
      setCurrentStep(Math.min(steps.length, currentStep + 1));
    } catch (error) {
      console.log("Error create invoice", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSkipPackageForm = async (value: any) => {
    ConfirmModal({
      title: "You want to exit the Select package.",
      message: "Do you want to exit the Select package?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        console.log(value);
        onModalClose();
        packageForm.resetFields();
        setCheckedStandardValues([]);
        setCheckedFeatureValues([]);
      },
    });
  };

  const onSkipPaymentForm = async (value: any) => {
    ConfirmModal({
      title: "You want to exit complete your payment.",
      message: "Do you want to exit Complete your payment?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        console.log(value);
        onModalClose();
        payForm.resetFields();
        setPreviewProofPayment("");
      },
    });
  };

  return (
    <>
      <StepModal isOpen={open} header={<Stepper />} onClose={onModalClose}>
        <Row style={{ marginTop: 12, marginBottom: 12 }}>
          <Col
            span={24}
            style={{
              justifyItems: "center",
            }}
          >
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
    </>
  );
};

export default SelectPackageModal;
