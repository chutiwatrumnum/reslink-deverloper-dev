import { useState, useEffect, useCallback } from "react";
import { Upload, Typography, message, Image, Button } from "antd";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import { DeleteOutlined } from "@ant-design/icons";
// import { NoImageIcon } from "../../assets/icons/Icons"; // มีอยู่แล้วในโค้ดเดิม
// import { whiteLabel } from "../../configs/theme"; // <— ไม่ได้ใช้ ลบได้
import "../styles/common.css";

const { Text } = Typography;

interface UploadImageGroupType {
  onChange: (url: string) => void;
  image: string;
  disabled?: boolean;
  className?: string;
  height?: number;
  ratio?: string;
  maxSizeMB?: number; // เผื่ออยากตั้งขนาดเอง
}

const UploadImageGroup = ({
  onChange,
  image,
  disabled = false,
  className,
  height = 360,
  ratio = "16:9 ratio (1280x720 px)",
  maxSizeMB = 1,
}: UploadImageGroupType) => {
  const [overSize, setOverSize] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const beforeUpload = (file: RcFile) => {
    const isLt = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLt) {
      message.error(`Image must be smaller than ${maxSizeMB}MB!`);
      setOverSize(true);
    } else {
      setOverSize(false);
    }
    // return true เพื่อไม่อัปโหลดไปเซิร์ฟเวอร์ (เราจะอ่านเป็น base64 เอง)
    return isLt;
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    // กันกรณีไม่มีไฟล์ต้นฉบับ (เช่น ลบไฟล์กลางทาง)
    const fileObj = info.file.originFileObj as RcFile | undefined;
    if (!fileObj) return;

    // mark เป็น done เพื่อให้ antd ไม่ค้างสถานะ uploading
    info.file.status = "done";

    getBase64(fileObj, (url) => {
      setImageUrl(url);
      onChange(url);
    });
  };

  // >>> ฟังก์ชันลบรูป (ที่หายไป)
  const handleDeleteImage = useCallback(() => {
    setImageUrl("");
    setOverSize(false);
    onChange("");
  }, [onChange]);

  useEffect(() => {
    setImageUrl(image || "");
  }, [image]);

  const renderImagePreview = () => {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 10,
          overflow: "hidden",
        }}>
        <Image
          src={imageUrl}
          alt="Preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          preview={false}
        />
        {/* Overlay with buttons */}
        {/* <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(0, 0, 0, 0.7)",
            padding: 12,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
          // ป้องกันการคลิกทะลุ
          onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            onClick={handleDeleteImage}
            style={{
              color: "#ff4d4f",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
            }}
            disabled={disabled}>
            Delete Image
          </Button>
        </div> */}
      </div>
    );
  };

  const renderPlaceholder = () => {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 10,
          border: "2px dashed #d9d9d9",
          backgroundColor: "#fafafa",
        }}>
        <p style={{ marginBottom: 12 }}>
          {/* ถ้า NoImageIcon มีอยู่แล้ว ใช้ได้เลย */}
          {/* <NoImageIcon color="#999" /> */}
        </p>
        <Text style={{ color: "#666", marginBottom: 4 }}>
          Upload your photo
        </Text>
        <Text style={{ color: "#999", fontSize: 12, textAlign: "center" }}>
          {ratio}
        </Text>
      </div>
    );
  };

  return (
    <>
      <div style={{ position: "relative", height }}>
        {imageUrl ? (
          <div style={{ position: "relative", height: "100%" }}>
            {renderImagePreview()}
            {/* Change Image Button */}
            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#666",
              }}>
              <DeleteOutlined
                style={{ fontSize: 16 }}
                onClick={handleDeleteImage}
              />
              <Upload
                name="uploadImage"
                maxCount={1}
                accept=".png,.jpg,.jpeg,.svg"
                beforeUpload={beforeUpload}
                onChange={handleChange}
                showUploadList={false}
                disabled={disabled}>
                <Button
                  type="link"
                  style={{
                    padding: 0,
                    height: "auto",
                    fontSize: 14,
                    color: "#666",
                  }}
                  disabled={disabled}>
                  Change Image
                </Button>
              </Upload>
            </div>
          </div>
        ) : (
          <Upload.Dragger
            name="uploadImage"
            maxCount={1}
            accept=".png,.jpg,.jpeg,.svg"
            beforeUpload={beforeUpload}
            onChange={handleChange}
            height={height}
            showUploadList={false}
            className={`${className ?? ""} uploadStyleControl`}
            disabled={disabled}>
            {renderPlaceholder()}
          </Upload.Dragger>
        )}
      </div>

      <Text
        hidden={!overSize}
        type="danger"
        style={{ marginTop: 8, display: "block" }}>
        {`*File size < ${maxSizeMB}MB , ${ratio}, *JPGs`}
      </Text>
    </>
  );
};

export default UploadImageGroup;
