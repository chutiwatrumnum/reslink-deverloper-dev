import { useState, useEffect } from "react";
import dayjs from "dayjs";
// Components
import { Form, Modal } from "antd";
// CSS
import "../style/projectTeam.css";

import type { ProjectTeamType } from "../../../stores/interfaces/projectTeam";

type InvitationInfoModal = {
  data?: ProjectTeamType;
  isInfoModalOpen: boolean;
  onCancel: () => void;
};

const InvitationInfoModal = ({
  data,
  isInfoModalOpen,
  onCancel,
}: InvitationInfoModal) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const onModalClose = () => {
    form.resetFields();
    onCancel();
  };

  useEffect(() => {
    setOpen(isInfoModalOpen);
  }, [isInfoModalOpen]);

  return (
    <Modal
      width={"30%"}
      open={open}
      title="Information"
      onCancel={onModalClose}
      footer={false}
      centered={true}
    >
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4 style={{ fontWeight: "600" }}>Created date & time</h4>
            <p>{data?.createdAt}</p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4 style={{ fontWeight: "600" }}>Phone number</h4>
            <p>{data?.contact ?? "-"}</p>
          </div>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h4 style={{ fontWeight: "600" }}>Created by</h4>
            <p>{`${data?.createdBy?.givenName} ${data?.createdBy?.familyName}`}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InvitationInfoModal;
