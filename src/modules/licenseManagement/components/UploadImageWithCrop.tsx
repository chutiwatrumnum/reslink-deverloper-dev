import { useState, useEffect } from "react";
import { Upload, Typography, Button, message } from "antd";
import type { GetProp, UploadProps } from "antd";
import ImgCrop from "antd-img-crop";
import { NoImageIcon } from "../../../assets/icons/Icons";
import { whiteLabel } from "../../../configs/theme";
import "../styles/uploadImageWithCrop.css";
import { DeleteOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";

const { Text } = Typography;

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

interface UploadImageWithCropPropsType {
  /** ค่าปัจจุบัน (base64 / dataURL) ที่ส่งมาจาก Form */
  value?: string;
  /** callback ของ AntD Form — เรียกเมื่อค่าเปลี่ยน */
  onChange?: (url: string) => void;

  aspectRatio?: number;
  disabled?: boolean;
  height?: number;
  ratio?: string; // ข้อความบอกสัดส่วน
}

const UploadImageWithCrop: React.FC<UploadImageWithCropPropsType> = ({
  value,
  onChange,
  aspectRatio = 16 / 9,
  disabled = false,
  height = 180,
  ratio = "16:9 ratio (1280x720 px)",
}) => {
  const [imageUrl, setImageUrl] = useState<string>(value || "");
  const [zoom, setZoom] = useState();

  // sync state ภายในให้ตาม value จากภายนอกเสมอ
  useEffect(() => {
    setImageUrl(value || "");
  }, [value]);

  const beforeUpload = (file: FileType) => {
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error("Image must smaller than 1MB!");
    }
    // คืน boolean ได้ แต่เราไม่ได้อัพขึ้น server อยู่แล้ว
    return isLt1M;
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    const file = info.file.originFileObj as RcFile | undefined;
    if (file) {
      getBase64(file, (url) => {
        setImageUrl(url);
        onChange?.(url); // แจ้ง Form ให้บันทึกค่าใหม่
      });
    }
  };

  const handleDelete = () => {
    setImageUrl("");
    onChange?.(""); // เคลียร์ค่าใน Form ด้วย
  };

  const uploadButton = (
    <div
      style={{
        width: "100%",
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        backgroundColor: "#fafafa",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <NoImageIcon
          color={whiteLabel.grayColor}
          className="noImageIconUpload"
        />
      </div>
      <Text style={{ color: whiteLabel.grayColor, marginBottom: 4 }}>
        Upload your photo
      </Text>
      <Text style={{ color: whiteLabel.grayColor, fontSize: "12px" }}>
        *File size &lt;1MB, {ratio}, *JPGs/PNGs
      </Text>
    </div>
  );

  return (
    <>
      <ImgCrop
        modalTitle="Image Preview"
        modalOk="Save"
        modalCancel="Cancel"
        aspect={aspectRatio}
        quality={1}
        cropShape="rect"
        minZoom={1}
        maxZoom={10}
        modalWidth={"40%"}
        zoomSlider={true}
        showReset={true}
        showGrid={true}
      >
        <Upload
          listType="picture-card"
          onChange={handleChange}
          beforeUpload={beforeUpload}
          maxCount={1}
          disabled={disabled}
          accept=".png,.jpg,.jpeg"
          style={{
            width: "100%",
            height: "80%",
            padding: 12,
          }}
          showUploadList={false}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="uploaded"
              style={{
                height,
                objectFit: "contain",
              }}
            />
          ) : (
            uploadButton
          )}
        </Upload>
      </ImgCrop>

      {imageUrl && (
        <Button
          onClick={handleDelete}
          size="small"
          type="text"
          icon={<DeleteOutlined style={{ color: whiteLabel.dangerColor }} />}
          style={{ marginTop: 4, color: whiteLabel.dangerColor }}
        >
          Change image
        </Button>
      )}
    </>
  );
};

export default UploadImageWithCrop;
