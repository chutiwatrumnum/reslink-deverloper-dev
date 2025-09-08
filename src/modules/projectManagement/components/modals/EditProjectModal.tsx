import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// Components
import { Form, Row, Col, Input, Radio, Select, Flex, Spin, Button } from "antd";
import UploadImageWithCrop from "../UploadImageWithCrop";
import FormModal from "../../../../components/common/FormModal";
import { callConfirmModal } from "../../../../components/common/Modal";
import SmallButton from "../../../../components/common/SmallButton";
// Types
// Types
import {
  SubDistrictDataType,
  ProjectManageType,
  CountryDataTypes,
  ProvinceDataTypes,
  DistrictDataTypes,
} from "../../../../stores/interfaces/ProjectManage";
import type { RadioChangeEvent } from "antd";
// Config input rule
import { requiredRule, telRule } from "../../../../configs/inputRule";
// APIs & Data
import { useEditProjectManagementMutation } from "../../../../utils/mutationsGroup/projectManagement";
import { useProjectTypeQuery } from "../../../../utils/queriesGroup/projectManagementQueries";
import "../../styles/projectManagement.css";

// JSON
import countryData from "../../json/countries.json";
import provinceData from "../../json/states.json";
import districtData from "../../json/cities.json";
import subDistrictData from "../../json/subDistrict.json";

// Google map
import GoogleMapComponent from "../GoogleMapComponent";

type EditProjectModalPropsType = {
  data?: ProjectManageType;
  isEditModalOpen: boolean;
  onOk: () => void;
  onCancel: () => void;
  onRefresh: () => void;
};

const DEFAULT_CENTER = { lat: 13.736717, lng: 100.523186 };

const EditProjectModal = ({
  data,
  isEditModalOpen,
  onOk,
  onCancel,
  onRefresh,
}: EditProjectModalPropsType) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  // ===== Loading ระหว่าง Save =====
  const [editProject, setEditProject] = useState(false);

  // Data Project Type => Condo, Village
  const { data: typeData } = useProjectTypeQuery();

  const editMutation = useEditProjectManagementMutation();

  const onFinish = async (value: any) => {
    callConfirmModal({
      title: "Request edit project?",
      message: "Are you sure you want to request the new project?",
      okMessage: "Save",
      cancelMessage: "Cancel",
      onOk: async () => {
        const formData = {
          ...value,
          lat: mapCoordsRef.current.lat,
          long: mapCoordsRef.current.lng,
        };
        if (formData.image === data?.image) {
          delete formData.image;
        }
        if (formData.logo === data?.logo) {
          delete formData.logo;
        }
        try {
          editMutation
            .mutateAsync({ id: data?.id ?? "", payload: formData })
            .then((res) => {
              console.log(res);
            });
          setEditProject(true);
          onOk();
          onRefresh();
        } catch (error: any) {
          console.log("Edit project failed: ", error);
        } finally {
          setEditProject(false);
        }
      },
    });
  };

  const onModalClose = () => {
    form.resetFields();
    setValue(undefined);
    setCountryValue("");
    setProvinceValue("");
    setDistrictValue("");
    setSubDistrictValue("");
    setPostalCodeValue("");
    setTimezone("");
    setHasPickedLocation(false);
    mapCoordsRef.current = DEFAULT_CENTER;
    onCancel();
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
    if (data && isEditModalOpen) {
      console.log(data);
      form.setFieldsValue({
        projectTypeId: data.type?.id?.toString(),
        name: data.name,
        image: data.image,
        logo: data.logo,
        lat: data.lat,
        long: data.long,
        contactNumber: data.contactNumber,
        email: data.email,
        country: data.country,
        province: data.province,
        district: data.district,
        subdistrict: data.subdistrict,
        road: data.road,
        subStreet: data.subStreet || "",
        address: data.address,
        zipCode: data.zipCode,
        timeZone: data.timeZone,
      });
      setCountryValue(data.country || "");
      setProvinceValue(data.province || "");
      setDistrictValue(data.district || "");
      setSubDistrictValue(data.subdistrict || "");
      setPostalCodeValue(data.zipCode || "");
      setTimezone(data.timeZone || "");

      // Set map coordinates
      if (data.lat && data.long) {
        mapCoordsRef.current = { lat: data.lat, lng: data.long };
        initialCenterRef.current = { lat: data.lat, lng: data.long };
        setHasPickedLocation(true);
      }
    }
  }, [isEditModalOpen, data]);

  //State for radio project type values
  const [value, setValue] = useState<number>();

  const onChange = (e: RadioChangeEvent) => {
    setValue(Number(e.target.value));
    console.log("Project type selected: ", e.target.value);
  };

  // ===== Map: no-flicker setup =====
  const mapCoordsRef = useRef<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const initialCenterRef = useRef(DEFAULT_CENTER);
  const [hasPickedLocation, setHasPickedLocation] = useState(false);

  const handleLocationChange = useCallback(
    (lat: number, lng: number) => {
      mapCoordsRef.current = { lat, lng };
      if (
        !hasPickedLocation &&
        (lat !== DEFAULT_CENTER.lat || lng !== DEFAULT_CENTER.lng)
      ) {
        setHasPickedLocation(true);
      }
    },
    [hasPickedLocation]
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

  const getDistrictData = async () => {
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

    form.setFieldsValue({
      province: "",
      district: "",
      timeZone: "",
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
        }));
      setOptionsProvince(countryProvinces);
      const timeZoneCountry = selectedCountry?.timezones?.[0]?.zoneName || "";
      setTimezone(timeZoneCountry);
      form.setFieldsValue({
        timeZone: timeZoneCountry,
      });
    }
  };

  const onSelectProvince = (value: string) => {
    setProvinceValue(value);
    const selectedProvince = allProvinces.find((p) => p.name === value);
    const provinceId = selectedProvince?.id;

    form.setFieldsValue({
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
          key: d.id,
        }));
      setOptionsDistrict(provinceDistrict);
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

    form.setFieldsValue({
      zipCode: zipCode?.toString(),
    });

    console.log("Sub-District Name: ", value);
    console.log("Sub-District ID: ", subDistrictId);
    console.log("Zip Code: ", zipCode);
  };
  const ProjectForm = () => {
    return (
      <Spin spinning={editProject}>
        <Form
          form={form}
          name="projectDraftForm"
          initialValues={{ remember: true }}
          autoComplete="off"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={() => {
            console.log("FINISHED FAILED");
          }}
        >
          <Row gutter={20} style={{ paddingInline: "12px" }}>
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
                ]}
              >
                <Radio.Group
                  size="middle"
                  onChange={onChange}
                  value={value}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    rowGap: 10,
                  }}
                  disabled
                >
                  {typeData?.map((item: any) => (
                    <Radio key={item.id} value={item.id.toString()}>
                      {item.nameEn}
                    </Radio>
                  )) || []}
                </Radio.Group>
              </Form.Item>
              <Form.Item label="Address" name="address" rules={requiredRule}>
                <Input
                  size="middle"
                  placeholder="Please input address"
                  maxLength={120}
                  showCount
                  disabled
                />
              </Form.Item>
              <Form.Item label="Soi" name="subStreet">
                <Input
                  size="middle"
                  placeholder="Please input Soi"
                  maxLength={60}
                  showCount
                  disabled
                />
              </Form.Item>
              <Form.Item label="Road" name="road" rules={requiredRule}>
                <Input
                  size="middle"
                  placeholder="Please input road"
                  maxLength={60}
                  showCount
                  disabled
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
                  disabled
                />
              </Form.Item>
              <Form.Item
                label="timezone"
                name="timeZone"
                rules={requiredRule}
                hidden
              >
                <Input
                  size="middle"
                  maxLength={60}
                  showCount
                  value={timezone}
                  disabled
                />
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
                  value={provinceValue}
                  options={optionsProvince}
                  onSelect={onSelectProvince}
                  allowClear
                  showSearch
                  disabled
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
                ]}
              >
                <Select
                  value={districtValue}
                  options={optionsDistrict}
                  onSelect={onSelectDistrict}
                  disabled
                  allowClear
                  showSearch
                  placeholder="Please select district"
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
                    message: "Please input sub-district!",
                  },
                ]}
              >
                <Input
                  size="middle"
                  placeholder="Please input sub-district"
                  disabled
                />
              </Form.Item>
              <Form.Item
                label="Postal code"
                name="zipCode"
                rules={requiredRule}
              >
                <Input
                  size="middle"
                  placeholder="Please input postal code"
                  maxLength={10}
                  showCount
                  disabled
                />
              </Form.Item>
              <Form.Item
                label="Juristic phone number"
                name="contactNumber"
                rules={telRule}
              >
                <Input
                  size="middle"
                  placeholder="Please input juristic phone"
                  maxLength={10}
                  showCount
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
                <UploadImageWithCrop ratio="16:9 Ratio" height={140} />
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
                <UploadImageWithCrop ratio="16:9 Ratio" height={140} />
              </Form.Item>
            </Col>
            {/* Google Map */}
            <Col span={6}>
              <Form.Item
                label="Map"
                rules={[
                  {
                    validator: () => {
                      const { lat, lng } = mapCoordsRef.current;
                      if (
                        !hasPickedLocation ||
                        (lat === DEFAULT_CENTER.lat &&
                          lng === DEFAULT_CENTER.lng)
                      ) {
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
                {hasPickedLocation && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "#333" }}>
                    Selected: {mapCoordsRef.current.lat.toFixed(6)},{" "}
                    {mapCoordsRef.current.lng.toFixed(6)}
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ justifyItems: "flex-end" }}>
              <Form.Item style={{ margin: 0 }}>
                {/* ถ้า SmallButton ของคุณรองรับ loading ก็ใส่ loading={savingProject} ได้ */}
                <SmallButton
                  className="saveButton"
                  message="Save"
                  form={form}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Spin>
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
