import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// Components
import { Form, Row, Col, Input, Radio, Select, Button, Flex } from "antd";
import UploadImageWithCrop from "../UploadImageWithCrop";
import FormModal from "../../../../components/common/FormModal";
import { callConfirmModal } from "../../../../components/common/Modal";
import SmallButton from "../../../../components/common/SmallButton";
import GoogleMapComponent from "../GoogleMapComponent";
// Types
import type {
  ProvinceDataType,
  DistrictDataType,
  SubDistrictDataType,
  ProjectFromDataType,
  ProjectManageType,
} from "../../../../stores/interfaces/ProjectManage";
import type { RadioChangeEvent } from "antd";
// Config input rule
import {
  requiredRule,
  emailRule,
  telRule,
} from "../../../../configs/inputRule";
// APIs & Data
import { useEditProjectManagementMutation } from "../../../../utils/mutationsGroup/projectManagement";
import { useProjectTypeQuery } from "../../../../utils/queriesGroup/projectManagementQueries";
// JSON
import provinceData from "../../json/province.json";
import districtData from "../../json/district.json";
import subDistrictData from "../../json/subDistrict.json";

import "../../styles/projectManagement.css";

type EditProjectModalPropsType = {
  data?: ProjectManageType;
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const EditProjectModal = ({
  data,
  isEditModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: EditProjectModalPropsType) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const [previewImage, setPreviewImage] = useState("");
  const [previewLogo, setPreviewLogo] = useState("");

  // Configuring Ant Design components
  const { TextArea } = Input;

  // Data Project Type => Condo, Village
  const { data: typeData } = useProjectTypeQuery();

  const editMutation = useEditProjectManagementMutation();

  // ===== Map: no-flicker setup =====
  const mapCoordsRef = useRef<{ lat: number; lng: number }>({
    lat: 13.736717,
    lng: 100.523186,
  });
  const initialCenterRef = useRef({ lat: 13.736717, lng: 100.523186 });
  const [hasPickedLocation, setHasPickedLocation] = useState(false);

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      mapCoordsRef.current = { lat, lng };
      if (!hasPickedLocation) {
        setHasPickedLocation(true);
      }

      // อัปเดต form values
      form.setFieldsValue({
        lat: lat,
        long: lng,
      });
    },
    [hasPickedLocation, form]
  );

  // สร้าง MapElement แค่ครั้งเดียว (ไม่ re-mount เมื่อ state อื่นเปลี่ยน)
  const MapElement = useMemo(
    () => (
      <GoogleMapComponent
        onLocationChange={handleLocationChange}
        initialLat={initialCenterRef.current.lat}
        initialLng={initialCenterRef.current.lng}
        height={470}
        width="100%"
        zoom={12}
        draggableMarker={true}
      />
    ),
    [handleLocationChange]
  );

  const onFinish = async (value: any) => {
    callConfirmModal({
      title: "Request edit project?",
      message: "Are you sure you want to request the new project?",
      okMessage: "Save",
      cancelMessage: "Cancel",
      onOk: async () => {
        // รวม coordinates จาก mapCoordsRef
        const payload = {
          ...value,
          lat: mapCoordsRef.current.lat,
          long: mapCoordsRef.current.lng,
        };

        console.log("Edit payload with coordinates:", payload);
        editMutation
          .mutateAsync({ id: data?.id ?? "", payload })
          .then((res) => {
            console.log(res);
          });
        onOk();
        onRefresh();
      },
    });
  };

  const onModalClose = () => {
    form.resetFields();
    // รีเซ็ต map state
    mapCoordsRef.current = { lat: 13.736717, lng: 100.523186 };
    setHasPickedLocation(false);
    onCancel();
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  // Set form values when selectedRecord changes
  useEffect(() => {
    setOpen(isEditModalOpen);
    if (data) {
      // ตั้งค่า coordinates สำหรับ map
      const lat = Number(data?.lat) || 13.736717;
      const lng = Number(data?.long) || 100.523186;

      mapCoordsRef.current = { lat, lng };
      initialCenterRef.current = { lat, lng };
      setHasPickedLocation(true);

      form.setFieldsValue({
        projectTypeId: String(data?.projectTypeId),
        active: data?.active,
        name: data?.name,
        image: data?.image,
        logo: data?.logo,
        lat: lat,
        long: lng,
        contactNumber: data?.contactNumber,
        email: data?.email,
        province: data?.province,
        district: data?.district,
        subdistrict: data?.subdistrict,
        road: data?.road,
        subStreet: data?.subStreet,
        address: data?.address,
        zipCode: data?.zipCode,
      });
    }
  }, [data, isEditModalOpen, form]);

  useEffect(() => {
    if (data) {
      setProvinceValue(data.province || "");
      setDistrictValue(data.district || "");
      setSubDistrictValue(data.subdistrict || "");
      setPostalCodeValue(data.zipCode || "");

      setPreviewImage(data.image || "");
      setPreviewLogo(data.logo || "");
      form.setFieldsValue({
        image: data.image,
        logo: data.logo,
      });
    }
  }, [data, form]);

  // 🔘 State for radio project type values
  const [value, setValue] = useState<number>();
  const onChange = (e: RadioChangeEvent) => {
    setValue(Number(e.target.value));
    console.log("Project type selected: ", e.target.value);
  };

  // 🏘️  Province Select State
  const [provinceValue, setProvinceValue] = useState<string>("");
  const [optionsProvince, setOptionsProvince] = useState<
    { value: string; label: string }[]
  >([]);
  const [allProvinces, setAllProvinces] = useState<ProvinceDataType[]>([]);

  // 🏡 District Select State
  const [districtValue, setDistrictValue] = useState<string>("");
  const [optionsDistrict, setOptionsDistrict] = useState<
    { value: string; label: string }[]
  >([]);
  const [allDistricts, setAllDistricts] = useState<DistrictDataType[]>([]);

  // 🏠 Sub-district Select State
  const [subDistrictValue, setSubDistrictValue] = useState<string>("");
  const [optionsSubDistrict, setOptionsSubDistrict] = useState<
    { value: string; label: string }[]
  >([]);
  const [allSubDistrict, setAllSubDistrict] = useState<SubDistrictDataType[]>(
    []
  );

  // Postal code state
  const [postalCodeValue, setPostalCodeValue] = useState<number | string>();

  const getProvincesData = () => {
    try {
      const data = provinceData as ProvinceDataType[];
      setAllProvinces(data);
      const provinceOptions = data
        .sort((a, b) => a.name_en.localeCompare(b.name_en))
        .map((p) => ({
          value: p.name_en,
          label: p.name_en,
        }));
      setOptionsProvince(provinceOptions);
    } catch (error: any) {
      console.error("Error loading province data:", error.message);
    }
  };

  const getDistrictData = async () => {
    try {
      const data = districtData as DistrictDataType[];
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
    getProvincesData();
    getDistrictData();
    getSubDistrictData();
  }, []);

  const onSelectProvince = (value: string) => {
    setProvinceValue(value);
    const selectedProvince = allProvinces.find((p) => p.name_en === value);
    const provinceId = selectedProvince?.id;

    // Reset district and sub-district when province changes
    setDistrictValue("");
    setSubDistrictValue("");
    setPostalCodeValue("");
    setOptionsDistrict([]);
    setOptionsSubDistrict([]);

    // Update form fields
    form.setFieldsValue({
      district: "",
      subdistrict: "",
      zipCode: "",
    });

    // Filter districts for the selected province
    if (provinceId) {
      const provinceDistricts = allDistricts
        .filter((p) => p.province_id === provinceId)
        .sort((a, b) => a.name_en.localeCompare(b.name_en))
        .map((d) => ({
          value: d.name_en,
          label: d.name_en,
        }));
      setOptionsDistrict(provinceDistricts);
    }
  };

  const onSelectDistrict = (value: string) => {
    setDistrictValue(value);
    const selectedDistrict = allDistricts.find((d) => d.name_en === value);
    const districtId = selectedDistrict?.id;

    // Reset sub-district when district changes
    setSubDistrictValue("");
    setPostalCodeValue("");
    setOptionsSubDistrict([]);

    // Update form field
    form.setFieldsValue({
      subdistrict: "",
      zipCode: "",
    });

    // Filter sub-districts for the selected district
    if (districtId) {
      const districtSubDistricts = allSubDistrict
        .filter((sd) => sd.amphure_id === districtId)
        .sort((a, b) => a.name_en.localeCompare(b.name_en))
        .map((sd) => ({
          value: sd.name_en,
          label: sd.name_en,
        }));
      setOptionsSubDistrict(districtSubDistricts);
    }
  };

  const onSelectSubDistrict = (value: string) => {
    setSubDistrictValue(value);
    const selectedSubDistrict = allSubDistrict.find(
      (sd) => sd.name_en === value
    );
    const zipCode = selectedSubDistrict?.zip_code;
    setPostalCodeValue(zipCode);

    form.setFieldsValue({
      zipCode: zipCode?.toString(),
    });
  };

  const ProjectForm = () => {
    return (
      <Form
        form={form}
        name="projectDraftFormEdit"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}>
        <Row gutter={20} style={{ paddingInline: "12px" }}>
          {/* Project name | Project type | Province | District | Sub-district | Road */}
          <Col span={6}>
            <Form.Item label="Project name" name="name" rules={requiredRule}>
              <Input
                size="middle"
                placeholder="Please input project name"
                maxLength={120}
                showCount
              />
            </Form.Item>
            <Form.Item
              label="Select project type"
              name="projectTypeId"
              rules={[
                { required: true, message: "Please select project type!" },
              ]}>
              <Radio.Group
                size="middle"
                onChange={onChange}
                value={value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  rowGap: 12,
                }}>
                {typeData?.map((item: any, index: number) => (
                  <Radio key={index} value={item.id}>
                    {item.nameEn}
                  </Radio>
                )) || []}
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="Province"
              name="province"
              rules={[
                {
                  required: true,
                  message: "Please select province!",
                },
              ]}>
              <Select
                value={provinceValue}
                options={optionsProvince}
                onSelect={onSelectProvince}
                allowClear
                showSearch
                placeholder="Please select province"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
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
              ]}>
              <Select
                value={districtValue}
                options={optionsDistrict}
                onSelect={onSelectDistrict}
                allowClear
                showSearch
                placeholder="Please select district"
                disabled={!provinceValue}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>

            <Form.Item
              label="Sub-district"
              name="subdistrict"
              rules={[
                {
                  required: true,
                  message: "Please select sub-district!",
                },
              ]}>
              <Select
                value={subDistrictValue}
                options={optionsSubDistrict}
                onSelect={onSelectSubDistrict}
                allowClear
                showSearch
                placeholder="Please select subdistrict"
                disabled={!districtValue}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
            <Form.Item label="Postal code" name="zipCode" rules={requiredRule}>
              <Input
                size="middle"
                placeholder="Please input postal code"
                maxLength={10}
                showCount
                value={postalCodeValue?.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setPostalCodeValue(value);
                  form.setFieldsValue({ zipCode: value });
                }}
                disabled={!subDistrictValue}
              />
            </Form.Item>
          </Col>
          {/* Soi | Address | Postal code | Phone number | Email */}
          <Col span={6}>
            <Form.Item label="Soi" name="subStreet">
              <Input
                size="middle"
                placeholder="Please input Soi"
                maxLength={60}
                showCount
              />
            </Form.Item>
            <Form.Item label="Address" name="address" rules={requiredRule}>
              <TextArea rows={6} placeholder="Please input address" />
            </Form.Item>
            <Form.Item label="Road" name="road">
              <Input
                size="middle"
                placeholder="Please input road"
                maxLength={60}
                showCount
              />
            </Form.Item>
            <Form.Item
              label="Phone number"
              name="contactNumber"
              rules={telRule}>
              <Input
                size="middle"
                placeholder="Please input phone number"
                maxLength={10}
                showCount
              />
            </Form.Item>
            <Form.Item label="Email" name="email" 
            // rules={emailRule}
            >
              <Input
                size="middle"
                placeholder="Please input email"
                maxLength={120}
                showCount
              />
            </Form.Item>
          </Col>
          {/* Project image | Project logo */}
          <Col span={6}>
            <Form.Item
              label="Project image"
              name="image"
              rules={[
                {
                  required: true,
                  message: "Please upload project image!",
                },
              ]}>
              <UploadImageWithCrop
                onChange={(url) => setPreviewImage(url)}
                image={previewImage}
                ratio="1920x1080 px"
                height={180}
              />
            </Form.Item>
            <Form.Item
              label="Logo project"
              name="logo"
              rules={[
                {
                  required: true,
                  message: "Please upload logo project!",
                },
              ]}>
              <UploadImageWithCrop
                onChange={(url) => setPreviewLogo(url)}
                image={previewLogo}
                ratio="1920x1080 px"
                height={180}
              />
            </Form.Item>
          </Col>
          {/* Google Map */}
          <Col span={6}>
            <Form.Item
              label="Map"
              rules={[
                {
                  validator: () => {
                    if (!hasPickedLocation) {
                      return Promise.reject(
                        "Please select a location on the map"
                      );
                    }
                    return Promise.resolve();
                  },
                },
              ]}>
              {MapElement}
              {hasPickedLocation && (
                <div style={{ marginTop: 12, fontSize: 12, color: "#333" }}>
                  Selected: {mapCoordsRef.current.lat.toFixed(6)},{" "}
                  {mapCoordsRef.current.lng.toFixed(6)}
                </div>
              )}
            </Form.Item>
            <Form.Item name="lat" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="long" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="country" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="timeZone" hidden>
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <SmallButton className="saveButton" message="Save" form={form} />
        </Form.Item>
      </Form>
    );
  };

  return (
    <FormModal
      width="90%"
      isOpen={open}
      title="Edit Project"
      content={<ProjectForm />}
      onOk={onOk}
      onCancel={onModalClose}
      className="projectEditFormModal"
    />
  );
};

export default EditProjectModal;
