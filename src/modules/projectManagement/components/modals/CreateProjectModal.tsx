import {
  useState,
  useEffect,
  ReactNode,
  useRef,
  useMemo,
  useCallback,
} from "react";

// Components
import ConfirmModal from "../../../../components/common/ConfirmModal";
import {
  Col,
  Form,
  Row,
  Input,
  Radio,
  Button,
  Card,
  Divider,
  Checkbox,
  Flex,
  message,
  Typography,
  Select,
  Spin,
} from "antd";
import StepBar from "../stepRequestNewProject/StepBar";
import StepModal from "../stepRequestNewProject/StepModal";
import PreviewSummary from "../stepRequestNewProject/PreviewSummary";
import UploadImageWithCrop from "../UploadImageWithCrop";
import UploadImagePayment from "../UploadImagePayment";
import SmallButton from "../../../../components/common/SmallButton";
import { openInvoicePdf } from "../InvoicePDF";
import GoogleMapComponent from "../GoogleMapComponent";
import SuccessModal from "../../../../components/common/SuccessModal";

// CSS
import "../../styles/stepModalCreate.css";
import "../../styles/newProjectForm.css";

// Types
import {
  FeaturesDataType,
  SubDistrictDataType,
  ProjectManagementCreatePayload,
  CreateInvoicePackageType,
  StepStatus,
  PaymentUpdate,
  InvoiceData,
  CountryDataTypes,
  ProvinceDataTypes,
  DistrictDataTypes,
} from "../../../../stores/interfaces/ProjectManage";
import type { RadioChangeEvent } from "antd";

//Image
import successPaymentImage from "../../../../assets/images/success-payment.png";

// Icons
import { DeleteOutlined } from "@ant-design/icons";

// Config input rule
import { requiredRule, telRule } from "../../../../configs/inputRule";

// JSON
import countryData from "../../json/countries.json";
import provinceData from "../../json/states.json";
import districtData from "../../json/cities.json";
import subDistrictData from "../../json/subDistrict.json";

// Data & APIs
import {
  postCreateProjectManagementMutation,
  postCreatePackageInvoiceMutation,
  useEditProjectManagementPaymentMutation,
} from "../../../../utils/mutationsGroup/projectManagement";
import {
  useProjectTypeQuery,
  useFeaturesQuery,
  usePreviewFeatureByLicenseIdQuery,
} from "../../../../utils/queriesGroup/projectManagementQueries";

type CreateProjectModalPropsType = {
  isCreateModalOpen: boolean;
  onCancel: () => void;
  onRefresh: () => void;
  projectId?: string | null;
  licenseId?: string | null;
  initialStep?: number;
};

type stepsType = {
  stepTitle: string;
  title: string;
  description: string;
  content: ReactNode;
};

const CreateProjectModal = ({
  isCreateModalOpen,
  onCancel,
  onRefresh,
  projectId: useProjectId,
  licenseId: useLicenseId,
  initialStep = 1,
}: CreateProjectModalPropsType) => {
  // 📋 Forms
  const [projectForm] = Form.useForm();
  const [packageForm] = Form.useForm();
  const [payForm] = Form.useForm();

  const [open, setOpen] = useState<boolean>(false);
  const [previewProofPayment, setPreviewProofPayment] = useState("");

  // 🔁 Mutation
  const createProject = postCreateProjectManagementMutation();
  const createPackageInvoice = postCreatePackageInvoiceMutation();
  const updatePayment = useEditProjectManagementPaymentMutation();
  // 📮 Queries
  const { data: typeData } = useProjectTypeQuery();
  const { data: featuresData } = useFeaturesQuery();

  // 🆔 Project id & License id state
  const [projectId, setProjectId] = useState<string | null>(
    useProjectId || null
  );
  const [licenseId, setLicenseId] = useState<string | null>(
    useLicenseId || null
  );

  const [previewExitingFeatures, setPreviewExitingFeatures] = useState(false);

  const { data: featureAndBankPreview } = usePreviewFeatureByLicenseIdQuery(
    licenseId!
  );
  // console.log(featureAndBankPreview);

  // Bank info data in step 3
  const bankName = featureAndBankPreview?.bank?.bankName || "";
  const accountNo = featureAndBankPreview?.bank?.accountNo || "";
  const accountName = featureAndBankPreview?.bank?.accountName || "";

  // Delete proof of payment func
  const handleDeleteProofPayment = () => {
    setPreviewProofPayment("");
    payForm.resetFields(["file"]);
  };

  // Step status management
  const [currentStep, setCurrentStep] = useState(initialStep);

  const getStepStatus = (index: number): StepStatus => {
    if (index + 1 < currentStep) return "completed";
    if (index + 1 === currentStep) return "active";
    return "pending";
  };

  const Stepper = () => {
    return (
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
  };

  //Configuring Ant Design components
  const { Text } = Typography;

  //State for radio project type values
  const [value, setValue] = useState<number>();

  const onChange = (e: RadioChangeEvent) => {
    setValue(Number(e.target.value));
    console.log("Project type selected: ", e.target.value);
  };

  //State for checkbox standard package and optional feature values
  const [checkedStandardValues, setCheckedStandardValues] = useState<string[]>(
    []
  );
  const [checkedFeatureValues, setCheckedFeatureValues] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (
      featuresData?.standard &&
      isCreateModalOpen &&
      !useLicenseId &&
      currentStep === 2
    ) {
      const defaultStandardItems = featuresData.standard
        .filter((item: FeaturesDataType) => item.isDefault)
        .map((item: FeaturesDataType) => String(item.id));

      setCheckedStandardValues(defaultStandardItems);
    }
  }, [featuresData, isCreateModalOpen, useLicenseId, currentStep]);

  const handleStandardChange = (checkedValues: string[]) => {
    setCheckedStandardValues(checkedValues);
  };

  // ===== Map: no-flicker setup =====
  const mapCoordsRef = useRef<{ lat: number; lng: number }>();
  const hasPickedLocationRef = useRef<boolean>(false);

  const handleLocationChange = useCallback((lat: number, lng: number) => {
    mapCoordsRef.current = { lat, lng };
    if (!hasPickedLocationRef.current) {
      hasPickedLocationRef.current = true;
    }
  }, []);

  // สร้าง MapElement แค่ครั้งเดียว (ไม่ re-mount เมื่อ state อื่นเปลี่ยน)
  const MapElement = useMemo(
    () => (
      <GoogleMapComponent
        onLocationChange={handleLocationChange}
        height={470}
        width="100%"
        zoom={12}
      />
    ),
    [handleLocationChange]
  );

  //Countries Select State
  const [countryValue, setCountryValue] = useState<string>("");
  const [optionCountry, setOptionCountry] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [allCountries, setAllCountries] = useState<CountryDataTypes[]>([]);

  // 🏘️  Province Select State
  const [provinceValue, setProvinceValue] = useState<string>("");
  const [optionsProvince, setOptionsProvince] = useState<
    { value: string; label: string }[]
  >([]);
  const [allProvinces, setAllProvinces] = useState<ProvinceDataTypes[]>([]);

  // 🏡 District Select State
  const [districtValue, setDistrictValue] = useState<string>("");
  const [optionsDistrict, setOptionsDistrict] = useState<
    { value: string; label: string }[]
  >([]);
  const [allDistricts, setAllDistricts] = useState<DistrictDataTypes[]>([]);

  // 🏠 Sub-district Select State
  const [subDistrictValue, setSubDistrictValue] = useState<string>("");
  const [optionsSubDistrict, setOptionsSubDistrict] = useState<
    { value: string; label: string }[]
  >([]);
  const [allSubDistrict, setAllSubDistrict] = useState<SubDistrictDataType[]>(
    []
  );

  //Postal code state
  const [postalCodeValue, setPostalCodeValue] = useState<number | string>();
  //Timezone
  const [timezone, setTimezone] = useState<string>("");

  const getCountriesData = () => {
    try {
      const data = countryData as CountryDataTypes[];
      setAllCountries(data);
      const countriesOptions = data
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => ({
          value: c.name,
          label: c.name,
        }));
      setOptionCountry(countriesOptions);
    } catch (error: any) {
      console.log("Error loading countries data:", error.message);
    }
  };

  const getProvincesData = () => {
    try {
      const data = provinceData as ProvinceDataTypes[];
      setAllProvinces(data);
    } catch (error: any) {
      console.log("Error loading province data:", error.message);
    }
  };

  const getDistrictData = () => {
    try {
      const data = districtData as DistrictDataTypes[];
      setAllDistricts(data);
    } catch (error: any) {
      console.error("Error loading district data:", error.message);
    }
  };

  const getSubDistrictData = async () => {
    try {
      const data = subDistrictData as SubDistrictDataType[];
      setAllSubDistrict(data);
    } catch (error: any) {
      console.error("Error loading sub-district data:", error.message);
    }
  };

  useEffect(() => {
    getCountriesData();
    getProvincesData();
    getDistrictData();
    getSubDistrictData();
  }, []);

  const onSelectCountry = (value: string) => {
    setCountryValue(value);
    const selectedCountry = allCountries.find((c) => c.name === value);
    const countryId = selectedCountry?.id;

    projectForm.setFieldsValue({
      province: "",
      district: "",
      subdistrict: "",
      zipCode: "",
    });

    if (countryId) {
      const countryProvinces = allProvinces
        .filter((p) => p.country_id === countryId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({
          value: p.name,
          label: p.name,
          key: p.id,
        }));
      setOptionsProvince(countryProvinces);
      const timeZoneCountry = selectedCountry?.timezones?.[0]?.zoneName || "";
      setTimezone(timeZoneCountry);
      projectForm.setFieldsValue({
        timeZone: timeZoneCountry,
      });
    }
  };

  const onSelectProvince = (value: string) => {
    setProvinceValue(value);
    const selectedProvince = allProvinces.find((p) => p.name === value);
    const provinceId = selectedProvince?.id;

    setDistrictValue("");
    setSubDistrictValue("");
    setPostalCodeValue("");
    setOptionsDistrict([]);

    projectForm.setFieldsValue({
      district: "",
      subdistrict: "",
      zipCode: "",
    });

    if (provinceId) {
      const provinceDistrict = allDistricts
        .filter((d) => d.state_id === provinceId)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((d) => ({
          value: d.name,
          label: d.name,
          key: `${d.id} + ${d.name}`,
        }));
      setOptionsDistrict(provinceDistrict);
      console.log(provinceDistrict);
    }
  };

  const onSelectDistrict = (value: string) => {
    setDistrictValue(value);
    const selectedDistrict = allDistricts.find((d) => d.name === value);
    const districtId = selectedDistrict?.id;

    console.log("District Name: ", value);
    console.log("District ID: ", districtId);

    setSubDistrictValue("");
    setPostalCodeValue("");
    setOptionsSubDistrict([]);
  };

  const onSelectSubDistrict = (value: string) => {
    setSubDistrictValue(value);
    const selectedSubDistrict = allSubDistrict.find(
      (sd) => sd.name_en === value
    );
    const subDistrictId = selectedSubDistrict?.id;
    const zipCode = selectedSubDistrict?.zip_code;

    setPostalCodeValue(zipCode);

    projectForm.setFieldsValue({
      zipCode: zipCode?.toString(),
    });

    console.log("Sub-District Name: ", value);
    console.log("Sub-District ID: ", subDistrictId);
    console.log("Zip Code: ", zipCode);
  };

  // ===== Loading ระหว่าง Save =====
  const [savingProject, setSavingProject] = useState(false);

  const onFinishProject = async (values: ProjectManagementCreatePayload) => {
    try {
      if (!projectId) {
        const { lat, lng } = mapCoordsRef.current ?? {};
        if (!hasPickedLocationRef.current || !lat || !lng) {
          message.error("Please select a location on the map");
          return;
        }

        setSavingProject(true);

        const payload: ProjectManagementCreatePayload = {
          ...values,
          projectTypeId: values.projectTypeId?.toString(),
          lat,
          long: lng,
          image: values.image || null,
          logo: values.logo || null,
        };

        const response = await createProject.mutateAsync(payload);
        const projectId = response.data.result?.id;
        setProjectId(projectId);
        console.log("Project ID:", projectId);
      }

      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving draft:", error);
    } finally {
      setSavingProject(false);
    }
  };

  const onCreateInvoicePackage = async (data: InvoiceData) => {
    try {
      await openInvoicePdf(data);
      setCurrentStep(Math.min(steps.length, currentStep + 1));
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
        projectId: projectId,
        standardBasePrice: Number(values.standardBasePrice),
        optionalBasePrice: Number(values.optionalBasePrice),
        totalStandard: Number(values.totalStandard),
        totalOptional: Number(values.totalOptional),
        vatPercent: Number(values.vatPercent?.toFixed(0) || vat.toFixed(0)),
        totalVat: Number(values.totalVat),
        totalPrice: Number(values.totalPrice),
        totalPriceWithVat: Number(values.totalPriceWithVat),
        features: parsedFeatures,
      };

      console.log("Pay load result:", payload);
      await createPackageInvoice.mutateAsync(payload).then(async (res) => {
        console.log("API RESPONSE:", res.data.result.pdf);
        await onCreateInvoicePackage(res.data.result.pdf);
        const licenseId = res.data?.result?.licenseId;
        setLicenseId(licenseId);
        console.log("License id: ", licenseId);
      });

      setCurrentStep(3);
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error("Failed to create invoice. Please try again.");
    }
  };

  const onFinishPayForm = async (values: PaymentUpdate) => {
    try {
      if (!licenseId) {
        message.error("License ID is missing, please try again");
        return;
      }

      const payload: PaymentUpdate = {
        id: licenseId,
        file: values.file,
      };

      console.log("Payment payload:", payload);
      const response = await updatePayment.mutate({ id: licenseId, payload });
      console.log("Payment update response:", response);
      setIsSuccessPayment(true);
    } catch (error) {
      console.error("Error saving pay form:", error);
      message.error("Failed to submit payment, please try again.");
    }
  };

  useEffect(() => {
    setOpen(isCreateModalOpen);
    if (isCreateModalOpen) {
      setCurrentStep(initialStep);
      setProjectId(useProjectId || null);
      setLicenseId(useLicenseId || null);
      // set success payment page to false
      setIsSuccessPayment(false);
      // reset upload slip preview
      setPreviewProofPayment("");
      // reset form file upload slip
      payForm.resetFields(["file"]);
    }
    if (isCreateModalOpen && initialStep === 1) {
      setCheckedFeatureValues([]);
      hasPickedLocationRef.current = false;
    }
  }, [isCreateModalOpen, initialStep, useProjectId, useLicenseId]);

  // Thank you AI
  const handleOptionalChange = (values: string[]) => {
    // Get all optional features
    const optionalFeatures = featuresData?.optional || [];

    // Filter children that have a parent bundle
    const filteredValues = values.filter((id: string) => {
      const feature = optionalFeatures.find((f: any) => f.id === id);

      if (!feature) return true;

      // Find parents of this feature (if it's a child)
      const parentBundles = optionalFeatures.flatMap(
        (f: any) =>
          f.featureBundles?.filter((b: any) => b.bundleFeaturesId === id) || []
      );

      const requiredParents = parentBundles.map((b: any) => b.featuresId);

      // Keep if no parent required OR at least one parent is checked
      return (
        requiredParents.length === 0 ||
        requiredParents.some((pid: string) => values.includes(pid))
      );
    });
    setCheckedFeatureValues(filteredValues);
  };
  // Thank you AI
  useEffect(() => {
    const existingFeatures = () => {
      if (licenseId && featureAndBankPreview?.features) {
        setPreviewExitingFeatures(true);

        try {
          const standardFeatures =
            featureAndBankPreview.features.standard || [];
          const optionalFeatures =
            featureAndBankPreview.features.optional || [];

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
        } finally {
          setPreviewExitingFeatures(false);
        }
      } else if (licenseId) {
        setPreviewExitingFeatures(true);
      } else {
        setPreviewExitingFeatures(false);
      }
    };
    existingFeatures();
  }, [licenseId, featureAndBankPreview, packageForm]);

  //Content Step 1: Project Draft Form
  const ProjectForm = () => {
    return (
      <Spin spinning={savingProject}>
        <Form
          form={projectForm}
          name="projectDraftForm"
          initialValues={{ remember: true }}
          autoComplete="off"
          layout="vertical"
          onFinish={onFinishProject}
          onFinishFailed={() => {
            console.log("FINISHED FAILED");
          }}
        >
          <Row gutter={20} style={{ paddingInline: "12px" }}>
            <Col span={6}>
              <Form.Item label="Project name" name="name" rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input project name"
                  maxLength={60}
                  showCount
                  className="inputCreateForm"
                />
              </Form.Item>
              <Form.Item
                label="Select project type"
                name="projectTypeId"
                rules={[
                  { required: true, message: "Please select project type!" },
                ]}
              >
                <Radio.Group
                  onChange={onChange}
                  value={value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                  className="radioProjectType"
                >
                  {typeData?.map((item: any, index: number) => (
                    <Radio key={index} value={item.id}>
                      {item.nameEn}
                    </Radio>
                  )) || []}
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Address" name="address" rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input address"
                  maxLength={60}
                  showCount
                  className="inputCreateForm"
                />
              </Form.Item>
              <Form.Item label="Soi" name="subStreet">
                <Input
                  size="large"
                  placeholder="Please input Soi"
                  maxLength={60}
                  showCount
                  className="inputCreateForm"
                />
              </Form.Item>
              <Form.Item label="Road" name="road" rules={requiredRule}>
                <Input
                  size="large"
                  placeholder="Please input road"
                  maxLength={60}
                  showCount
                  className="inputCreateForm"
                />
              </Form.Item>
              <Form.Item
                label="Juristic phone number"
                name="contactNumber"
                rules={telRule}
              >
                <Input
                  size="large"
                  placeholder="Please input juristic phone"
                  maxLength={10}
                  showCount
                  className="inputCreateForm"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Country"
                name="country"
                rules={[
                  {
                    required: true,
                    message: "Please input country!",
                  },
                ]}
              >
                <Select
                  size="large"
                  value={countryValue}
                  options={optionCountry}
                  onSelect={onSelectCountry}
                  allowClear
                  showSearch
                  placeholder="Please select country"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="selectCreateForm"
                />
              </Form.Item>
              <Form.Item
                label="timezone"
                name="timeZone"
                rules={requiredRule}
                hidden
              >
                <Input size="large" maxLength={60} showCount value={timezone} />
              </Form.Item>
              <Form.Item
                label="Province"
                name="province"
                rules={[
                  {
                    required: true,
                    message: "Please select province!",
                  },
                ]}
              >
                <Select
                  size="large"
                  value={provinceValue}
                  options={optionsProvince}
                  onSelect={onSelectProvince}
                  allowClear
                  showSearch
                  disabled={!countryValue}
                  placeholder="Please select province"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="selectCreateForm"
                />
              </Form.Item>
              <Form.Item
                label="District"
                name="district"
                rules={[
                  {
                    required: true,
                    message: "Please select district!",
                  },
                ]}
              >
                <Select
                  size="large"
                  value={districtValue}
                  options={optionsDistrict}
                  onSelect={onSelectDistrict}
                  disabled={!provinceValue}
                  allowClear
                  showSearch
                  placeholder="Please select district"
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  className="selectCreateForm"
                />
              </Form.Item>
              <Form.Item
                label="Sub-district"
                name="subdistrict"
                rules={[
                  {
                    required: true,
                    message: "Please input sub-district!",
                  },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Please input sub-district"
                  className="inputCreateForm"
                />
              </Form.Item>
              <Form.Item
                label="Postal code"
                name="zipCode"
                rules={requiredRule}
              >
                <Input
                  size="large"
                  placeholder="Please input postal code"
                  maxLength={10}
                  showCount
                  className="inputCreateForm"
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Project image (App cover)"
                name="image"
                valuePropName="value"
                rules={[
                  {
                    required: true,
                    message: "Please upload project image!",
                  },
                ]}
              >
                <UploadImageWithCrop ratio="16:9 Ratio" height={200} />
              </Form.Item>
              <Form.Item
                label="Logo project"
                name="logo"
                valuePropName="value"
                rules={[
                  {
                    required: true,
                    message: "Please upload logo project!",
                  },
                ]}
              >
                <UploadImageWithCrop
                  aspectRatio={1 / 1}
                  ratio="1:1 Ratio"
                  height={200}
                />
              </Form.Item>
            </Col>
            {/* Google Map */}
            <Col span={6}>
              <Form.Item
                label="Map"
                required
                rules={[
                  {
                    validator: () => {
                      const { lat, lng } = mapCoordsRef.current ?? {};
                      if (!hasPickedLocationRef.current || !lat || !lng) {
                        return Promise.reject(
                          "Please select a location on the map"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                {MapElement}
              </Form.Item>
            </Col>
          </Row>
          <Row style={{ paddingBlock: 8 }}>
            <Col span={24}>
              <Flex justify="center" align="center">
                <Form.Item className="buttonGroupCreateProject">
                  <Button
                    size="large"
                    onClick={onCancelProjectDraftForm}
                    style={{
                      width: 200,
                      borderColor: "var(--secondary-color)",
                      marginRight: 12,
                    }}
                    disabled={savingProject}
                  >
                    Cancel
                  </Button>
                  {/* ถ้า SmallButton ของคุณรองรับ loading ก็ใส่ loading={savingProject} ได้ */}
                  <SmallButton
                    className="saveButton"
                    message="Next"
                    form={projectForm}
                  />
                </Form.Item>
              </Flex>
            </Col>
          </Row>
        </Form>
      </Spin>
    );
  };
  //Content Step 2: Select Package
  const PackageForm = () => {
    useEffect(() => {
      packageForm.setFieldsValue({
        standardPackage: checkedStandardValues,
        optionalFeature: checkedFeatureValues,
      });
    }, [checkedStandardValues, checkedFeatureValues, packageForm]);
    if (previewExitingFeatures) {
      return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            Loading existing package selection...
          </div>
        </div>
      );
    }
    return (
      <Form
        form={packageForm}
        name="packageForm"
        initialValues={{
          remember: true,
          standardPackage: checkedStandardValues,
          optionalFeature: checkedFeatureValues,
        }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinishSelectedPackage}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        {/* Hidden fields for pricing & features */}
        <Form.Item name="standardBasePrice" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="optionalBasePrice" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="totalStandard" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="totalOptional" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="totalPrice" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="totalVat" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="vatPercent" hidden initialValue={7}>
          <Input />
        </Form.Item>
        <Form.Item name="totalPriceWithVat" hidden>
          <Input />
        </Form.Item>
        <Form.Item name="features" hidden>
          <Input />
        </Form.Item>
        <Row gutter={20} style={{ paddingInline: "12px" }}>
          <Col span={14}>
            <Row>
              <Col span={24}>
                {/* Standard Package Card */}
                <Card style={{ marginBottom: 12 }} className="cardPackage">
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
                  <Form.Item
                    name="standardPackage"
                    style={{ marginTop: 24 }}
                    initialValue={checkedStandardValues}
                  >
                    <Checkbox.Group
                      style={{ width: "100%" }}
                      value={checkedStandardValues}
                      onChange={handleStandardChange}
                    >
                      <Row gutter={10}>
                        {featuresData?.standard?.map(
                          (item: FeaturesDataType, index: number) => {
                            const isChecked = checkedStandardValues.includes(
                              String(item.id)
                            );
                            return (
                              <Col span={12} key={index}>
                                <Checkbox
                                  disabled={item.isDefault === true}
                                  value={String(item.id)}
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
                        ) || []}
                      </Row>
                    </Checkbox.Group>
                  </Form.Item>
                </Card>
                {/* Optional Features Card */}
                <Card style={{ marginBottom: 12 }} className="cardPackage">
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
                      value={checkedFeatureValues}
                      onChange={handleOptionalChange}
                      className="optionalFeature"
                    >
                      <Row gutter={10}>
                        {featuresData?.optional?.map(
                          (item: any, index: number) => {
                            const parentBundles =
                              featuresData?.optional?.flatMap(
                                (f: any) =>
                                  f.featureBundles?.filter(
                                    (b: any) =>
                                      b.bundleFeaturesId === String(item.id)
                                  ) || []
                              );

                            const requiredParents = parentBundles.map(
                              (b: any) => String(b.featuresId)
                            );

                            const isParentChecked =
                              requiredParents.length === 0 ||
                              requiredParents.some((pid: string) =>
                                checkedFeatureValues.includes(pid)
                              );

                            return (
                              <Col span={12} key={index}>
                                <Checkbox
                                  value={String(item.id)} // Ensure String conversion
                                  className="packageBoxCustom"
                                  disabled={!isParentChecked}
                                  style={{
                                    borderColor: checkedFeatureValues.includes(
                                      String(item.id)
                                    )
                                      ? "var(--secondary-color)"
                                      : "#EBEBEB",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "100%",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <span>{item.name}</span>
                                    <span
                                      style={{
                                        color: checkedFeatureValues.includes(
                                          String(item.id)
                                        )
                                          ? "var(--success-color)"
                                          : "#3f3f3f",
                                        fontWeight:
                                          checkedFeatureValues.includes(
                                            String(item.id)
                                          )
                                            ? 600
                                            : 300,
                                      }}
                                    >
                                      {Number(item.price).toLocaleString()}
                                    </span>
                                  </div>
                                </Checkbox>
                              </Col>
                            );
                          }
                        ) || []}
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
                  form={packageForm}
                  checkedStandardValues={checkedStandardValues}
                  checkedFeatureValues={checkedFeatureValues}
                  standardPackage={featuresData?.standard || []}
                  optionalFeature={featuresData?.optional || []}
                  licenseId={licenseId}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Flex justify="center" align="center">
              <Form.Item className="buttonGroupCreateProject">
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
                  message={!packageForm ? "Next" : "Create invoice"}
                  className="saveButton"
                />
              </Form.Item>
            </Flex>
          </Col>
        </Row>
      </Form>
    );
  };

  // Content Step 3: Pay
  const PayForm = () => {
    return (
      <Form
        form={payForm}
        name="payForm"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinishPayForm}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <Row gutter={20} style={{ paddingInline: "12px" }}>
          <Col span={14}>
            <Card style={{ marginBottom: 12, borderRadius: "15px" }}>
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
                  {
                    required: true,
                    message: "Please upload proof of payment!",
                  },
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
                      style={{
                        color: "var(--danger-color)",
                      }}
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
              <Form.Item className="buttonGroupCreateProject">
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
  };

  // Content display success payment
  const PaySuccessPage = () => {
    return (
      <Flex
        vertical={true}
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
          vertical={true}
          justify="center"
          align="center"
          style={{ marginBottom: 24 }}
        >
          <Text style={{ color: "#002C55" }}>
            Your payment slip has been submitted.
          </Text>
          <Text style={{ color: "#002C55" }}>
            We{"'"}re verifying your payment and will notify you once your
            license is activated.
          </Text>
          <Text style={{ color: "#002C55" }}>
            Verification usually takes 1–2 business days during working time.
          </Text>
        </Flex>
        <Button
          size="large"
          type="primary"
          style={{ width: 250 }}
          onClick={() => {
            onRefresh();
            onCancel();
            projectForm.resetFields();
            packageForm.resetFields();
            payForm.resetFields();
            setCheckedFeatureValues([]);
            mapCoordsRef.current = undefined;
            hasPickedLocationRef.current = false;
          }}
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
      stepTitle: "Project draft",
      title: "Start building your project",
      description:
        "To start building your project, please fill out all the information.",
      content: <ProjectForm />,
    },
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
    setCurrentStep(1);
    setProjectId(null);
    setLicenseId(null);
    setIsSuccessPayment(false);
    mapCoordsRef.current = undefined;
    hasPickedLocationRef.current = false;
    onCancel();
    onRefresh();
  };

  const onCancelProjectDraftForm = async (value: any) => {
    ConfirmModal({
      title: "You want to exit the project draft page.",
      message: "Do you want to exit the project draft page?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        console.log(value);
        projectForm.resetFields();
        setIsSuccessPayment(false);
        setLicenseId(null);
        mapCoordsRef.current = undefined;
        hasPickedLocationRef.current = false;
        onModalClose();
        onRefresh();
        onCancel();

        setTimeout(() => {
          SuccessModal("Success");
        }, 100);
      },
    });
  };

  const onSkipPackageForm = async (value: any) => {
    ConfirmModal({
      title: "You want to exit the select package.",
      message: "Do you want to exit the select package?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        packageForm.resetFields();

        setIsSuccessPayment(false);

        mapCoordsRef.current = undefined;
        hasPickedLocationRef.current = false;

        setCheckedFeatureValues([]);
        setCheckedStandardValues([]);

        // Reset step to 1 for next modal opening
        setCurrentStep(1);
        setProjectId(null);
        setLicenseId(null);

        onModalClose();
        onRefresh();
        onCancel();

        setTimeout(() => {
          SuccessModal("Success");
        }, 100);
      },
    });
  };

  const onSkipPaymentForm = async (value: any) => {
    ConfirmModal({
      title: "You want to exit complete your payment.",
      message: "Do you want to exit complete your payment?",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        payForm.resetFields();
        setIsSuccessPayment(false);
        setPreviewProofPayment("");

        mapCoordsRef.current = undefined;
        hasPickedLocationRef.current = false;

        // Reset step to 1 for next modal opening
        setCurrentStep(1);
        setProjectId(null);
        setLicenseId(null);

        onModalClose();
        onRefresh();
        onCancel();

        setTimeout(() => {
          SuccessModal("Success");
        }, 100);
      },
    });
  };

  return (
    <>
      <StepModal isOpen={open} header={<Stepper />}>
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

export default CreateProjectModal;
