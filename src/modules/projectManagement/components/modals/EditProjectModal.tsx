import { useState, useEffect, useRef } from "react";
// Components
import { Form, Row, Col, Input, Radio, Select, Button, Flex } from "antd";
import UploadImageWithCrop from "../UploadImageWithCrop";
import FormModal from "../../../../components/common/FormModal";
import { callConfirmModal } from "../../../../components/common/Modal";
import SmallButton from "../../../../components/common/SmallButton";
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
// Map
import GeoCoderControl from "../GeoCoderControl";
import maplibregl from "maplibre-gl";
import type { MapLayerMouseEvent } from "maplibre-gl";
import {
  Map,
  FullscreenControl,
  NavigationControl,
} from "react-map-gl/maplibre";
import "@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css";
import "maplibre-gl/dist/maplibre-gl.css";

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

  const onFinish = async (value: any) => {
    callConfirmModal({
      title: "Request edit project?",
      message: "Are you sure you want to request the new project?",
      okMessage: "Save",
      cancelMessage: "Cancel",
      onOk: async () => {
        // console.log(value);
        editMutation
          .mutateAsync({ id: data?.id ?? "", payload: value })
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
    onCancel();
  };

  useEffect(() => {
    setOpen(isEditModalOpen);
  }, [isEditModalOpen]);

  // Set form values when selectedRecord changes
  useEffect(() => {
    setOpen(isEditModalOpen);
    if (data) {
      form.setFieldsValue({
        projectTypeId: String(data?.projectTypeId),
        active: data?.active,
        name: data?.name,
        image: data?.image,
        logo: data?.logo,
        lat: Number(data?.lat),
        long: Number(data?.long),
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
  }, [data, isEditModalOpen]);

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
  }, [data]);
  // 🔘 State for radio project type values
  const [value, setValue] = useState<number>();
  const onChange = (e: RadioChangeEvent) => {
    setValue(Number(e.target.value));
    console.log("Project type selected: ", e.target.value);
  };

  //   console.log("Form values:", values);

  //   if (!selectedRecord?.id && !selectedRecord?.userId) {
  //     console.error("No ID found for editing");
  //     return;
  //   }

  //   callConfirmModal({
  //     title: "Edit team invitation?",
  //     message: "Are you sure you want to edit this invitation?",
  //     okMessage: "Confirm",
  //     cancelMessage: "Cancel",
  //     onOk: async () => {
  //       const userId = selectedRecord.id || selectedRecord.userId!;
  //       const payload = {
  //         givenName: values.firstName,
  //         familyName: values.lastName,
  //         middleName: values.middleName || "",
  //         contact: values.contact,
  //         roleId: Number(values.roleId), // แปลงเป็น number
  //       };

  //       console.log(
  //         "Submitting invitation edit with ID:",
  //         userId,
  //         "and payload:",
  //         payload
  //       );

  //       editMutation.mutate(
  //         { userId, payload, isListEdit: false },
  //         {
  //           onSuccess: () => {
  //             console.log("Edit invitation successful");
  //             form.resetFields();
  //             onOk();
  //             onRefresh();
  //           },
  //           onError: (error: any) => {
  //             console.error("Edit invitation failed:", error);
  //             // Error message จะแสดงจาก mutation แล้ว
  //           },
  //         }
  //       );
  //     },
  //   });
  // };
  // Map
  const mapRef = useRef<any>();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const currentLocation = useRef<{
    long: number;
    lat: number;
  }>();

  const setMarker = (long: number, lat: number) => {
    if (!markerRef.current) {
      currentLocation.current = { long: long, lat: lat };
      markerRef.current = new maplibregl.Marker({
        anchor: "bottom",
        color: "red",
        draggable: true,
      })
        .setLngLat([long, lat])
        .addTo(mapRef.current?.getMap());
      // Add dragend handler
      markerRef.current.on("dragend", (e) => {
        const { lng, lat } = e.target.getLngLat();
        currentLocation.current = { long: lng, lat: lat };
      });
    } else {
      markerRef.current.setLngLat([long, lat]);
      currentLocation.current = { long: long, lat: lat };
    }
  };

  const onMapClick = (e: MapLayerMouseEvent) => {
    const { lng, lat } = e.lngLat;
    setMarker(lng, lat);
    form.setFieldsValue({
      lat: lat.toString(),
      long: lng.toString(),
    });
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
    // console.log("Province Name: ", value);
    // console.log("Province ID: ", provinceId);

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
    // console.log("District Name: ", value);
    // console.log("District ID: ", districtId);

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

    // console.log("Sub-District Name: ", value);
    // console.log("Sub-District ID: ", subDistrictId);
    // console.log("Zip Code: ", zipCode);
  };

  const ProjectForm = () => {
    return (
      <Form
        form={form}
        name="projectDraftFormEdit"
        initialValues={{ remember: true, currentLocation }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
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
                  rowGap: 12,
                }}
              >
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
              ]}
            >
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
              ]}
            >
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
              ]}
            >
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
              rules={telRule}
            >
              <Input
                size="middle"
                placeholder="Please input phone number"
                maxLength={10}
                showCount
              />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={emailRule}>
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
              ]}
            >
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
              ]}
            >
              <UploadImageWithCrop
                onChange={(url) => setPreviewLogo(url)}
                image={previewLogo}
                ratio="1920x1080 px"
                height={180}
              />
            </Form.Item>
          </Col>
          {/* Map */}
          <Col span={6}>
            <Form.Item label="Map" rules={requiredRule}>
              <div
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    const geocoderInput = document.querySelector(
                      ".mapboxgl-ctrl-geocoder input"
                    ) as HTMLInputElement;
                    geocoderInput?.focus();
                  }
                }}
                tabIndex={0}
                style={{ outline: "none" }}
              >
                <Map
                  initialViewState={{
                    longitude: 100.523186,
                    latitude: 13.736717,
                    zoom: 12,
                  }}
                  mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
                  style={{ width: "100%", height: 470, borderRadius: 8 }}
                  onClick={onMapClick}
                  ref={mapRef}
                >
                  <GeoCoderControl position="top-left" />
                  <FullscreenControl />
                  <NavigationControl />
                </Map>
              </div>
            </Form.Item>
            <Form.Item name="lat" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="long" hidden>
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
