import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../stores";
import { usePermission } from "../../../utils/hooks/usePermission";

import Header from "../../../components/templates/Header";
import UploadCircleBtn from "../../../components/group/UploadCircleBtn";
import MediumButton from "../../../components/common/MediumButton";
import MediumActionButton from "../../../components/common/MediumActionButton";

import { Typography, Form, Input, Avatar, Row, Col } from "antd";
import { telRule } from "../../../configs/inputRule";
import { UserIcon } from "../../../assets/icons/Icons";

import type { FormInstance } from "antd/es/form";

import "../styles/setting.css";
import { whiteLabel } from "../../../configs/theme";
import {
  getDataProfile,
  updateProfile,
  UpdateProfilePayload,
} from "../service/api/profile_api";
import FailedModal from "../../../components/common/FailedModal";
import SuccessModal from "../../../components/common/SuccessModal";
import { UpdateProfileSuccessMessage } from "../constants/profile";
import ChangePasswordModal from "../components/ChangePasswordModal";

const { Text } = Typography;

const Profile = () => {
  // variables
  const [ProfileEditForm] = Form.useForm();
  const formRef = useRef<FormInstance>(null);
  const [previewImage, setPreviewImage] = useState<string>();
  const [dataProfileDetail, setDataProfileDetail] = useState<any>(null);
  const [edited, setEdited] = useState<boolean>(true);
  const [reRender, setReRender] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

  const permissions = useSelector(
    (state: RootState) => state.common?.permission
  );
  const { access } = usePermission(permissions);

  useEffect(() => {
    (async function () {
      const result = await getDataProfile();
      if (result?.status) {
        await setPreviewImage(result.data.imageProfile);
        await ProfileEditForm.setFieldsValue({
          ...result.data,
          givenName: result.data.firstName,
          familyName: result.data.lastName,
          middleName: result.data.middleName || "",
        });
        await setDataProfileDetail(result.data);
      }
    })();
  }, [reRender]);

  // functions
  const onFinish = async (values: any) => {
    try {
      // เตรียมข้อมูลสำหรับ API ใหม่
      const profileUpdatePayload: UpdateProfilePayload = {
        givenName: values.givenName,
        middleName: values.middleName || null,
        familyName: values.familyName,
        contact: values.contact || "",
      };

      // เรียกใช้ API ใหม่
      const updateResult = await updateProfile(profileUpdatePayload);

      if (!updateResult.status) {
        FailedModal(updateResult.error || "Failed to update profile");
        return;
      }

      // แสดงข้อความสำเร็จและรีเฟรชข้อมูล
      SuccessModal(UpdateProfileSuccessMessage);
      await setEdited(true);
      await setReRender(!reRender);
    } catch (error) {
      console.error("Error updating profile:", error);
      FailedModal("Failed to update profile");
    }
  };

  const onFinishFailed = (errorInfo: object) => {
    // Form validation failed
  };

  const onEdit = async () => {
    if (edited) {
      setEdited(false);
    } else {
      await onCancel();
    }
  };

  const onCancel = async () => {
    setEdited(true);
    setPreviewImage(dataProfileDetail.imageProfile);
    ProfileEditForm.setFieldsValue({
      ...dataProfileDetail,
      givenName: dataProfileDetail.firstName,
      familyName: dataProfileDetail.lastName,
      middleName: dataProfileDetail.middleName || "",
    });
  };

  const onImageChanged = (image: string) => {
    setPreviewImage(image);
    ProfileEditForm.setFieldValue("image", image);
  };

  const handleChangePasswordClick = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleChangePasswordClose = () => {
    setIsChangePasswordModalOpen(false);
  };

  return (
    <>
      <Header title="Profile" />
      <div className="profileContainer">
        <Form
          name="recovery"
          form={ProfileEditForm}
          className="formProfile"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off">
          {/* Profile Image Section */}
          <div className="imageProfileContainer">
            <div style={{ position: "relative" }}>
              <Avatar
                size={180}
                className="profileImage"
                src={previewImage}
                icon={
                  <UserIcon
                    className="avatarSize"
                    color={whiteLabel.primaryColor}
                  />
                }
              />
              <Form.Item name="image" className="uploadImageBtn">
                <UploadCircleBtn disabled={edited} onChange={onImageChanged} />
              </Form.Item>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="profileFormContainer">
            {/* Row 1: First Name, Middle Name, Last Name */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">First name</Text>
                  }
                  name="givenName"
                  rules={[
                    { required: true, message: "Please input first name" },
                  ]}>
                  <Input
                    disabled={edited}
                    size="large"
                    placeholder="Please input first name"
                    maxLength={120}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Middle name</Text>
                  }
                  name="middleName">
                  <Input
                    disabled={edited}
                    size="large"
                    placeholder="Middle name (optional)"
                    maxLength={120}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Last name</Text>
                  }
                  name="familyName"
                  rules={[
                    { required: true, message: "Please input last name" },
                  ]}>
                  <Input
                    disabled={edited}
                    size="large"
                    placeholder="Please input last name"
                    maxLength={120}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 2: Mobile No., Email, Role */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Mobile no.</Text>
                  }
                  name="contact"
                  rules={telRule}>
                  <Input
                    disabled={edited}
                    size="large"
                    placeholder="Please input tel"
                    maxLength={10}
                    showCount
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<Text className="textColor semiBoldText">Email</Text>}
                  name="email">
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Please input email"
                    maxLength={120}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={<Text className="textColor semiBoldText">Role</Text>}
                  name="roleName">
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Select role"
                    maxLength={120}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 3: Project Name */}
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <Text className="textColor semiBoldText">Developer Name</Text>
                  }
                  name="developerName">
                  <Input
                    disabled={true}
                    size="large"
                    placeholder="Developer name"
                    maxLength={120}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Action Buttons */}
          <Form.Item className="profileActionButtons">
            <Row gutter={16} justify="center">
              <Col>
                <MediumActionButton
                  type="default"
                  className="ProfileButton"
                  message={edited ? "Edit" : "Cancel"}
                  onClick={onEdit}
                  // disabled={!access("profile", "edit")}
                />
              </Col>
              <Col>
                <MediumActionButton
                  type="default"
                  className="ProfileButton"
                  message="Change password"
                  onClick={handleChangePasswordClick}
                />
              </Col>
              <Col>
                <MediumButton
                  // disabled={edited || !access("profile", "edit")}
                  className="ProfileSaveButton"
                  message="Save"
                  form={ProfileEditForm}
                />
              </Col>
            </Row>
          </Form.Item>
        </Form>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={handleChangePasswordClose}
        />
      </div>
    </>
  );
};

export default Profile;
