import { useState, useEffect } from "react";

import { Upload, Typography, message, Flex } from "antd";
import { whiteLabel } from "../../../configs/theme";

import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import type { UploadChangeParam } from "antd/es/upload";
import { InboxOutlined } from "@ant-design/icons";
import Column from "antd/es/table/Column";
const { Text } = Typography;

interface UploadImageGroupType {
  onChange: (url: string) => void;
  image: string;
  disabled?: boolean;
  className?: string;
  height?: number;
}

const UploadImagePayment = ({
  onChange,
  image,
  disabled = false,
  className,
  height = 360,
}: UploadImageGroupType) => {
  const [overSize, setOverSize] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const beforeUpload = (file: RcFile) => {
    const isLt2M = file.size / 1024 / 1024 < 1;
    if (!isLt2M) {
      message.error("Image must smaller than 1MB!");
      setOverSize(true);
    } else {
      setOverSize(false);
    }
    return isLt2M;
  };

  const getBase64 = (img: RcFile, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result as string));
    reader.readAsDataURL(img);
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    const file = info.file.originFileObj as RcFile;
    if (file) {
      getBase64(file, (url) => {
        setImageUrl(url);
        onChange(url);
      });
    }
  };

  useEffect(() => {
    setImageUrl(image);
  }, [image]);

  return (
    <>
      <Upload.Dragger
        name="uploadImage"
        maxCount={1}
        accept=".png, .jpg, .jpeg, .svg"
        beforeUpload={beforeUpload}
        onChange={handleChange}
        height={height}
        showUploadList={false}
        className={className + " uploadStyleControl"}
        disabled={disabled}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="uploaded"
            style={{
              width: "100%",
              maxHeight: 220,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
            }}
          >
            <InboxOutlined
              style={{
                fontSize: 48,
                color: "var(--secondary-color)",
                marginBottom: 8,
              }}
            />
            <Flex justify="center" align="center" gap={2} vertical={true}>
              <Text style={{ color: whiteLabel.blackColor, margin: 0 }}>
                Upload your proof of payment
              </Text>
              <Text style={{ color: whiteLabel.blackColor, margin: 0 }}>
                {`*File size <1MB, *JPGs`}
              </Text>
            </Flex>
          </div>
        )}
      </Upload.Dragger>
    </>
  );
};

export default UploadImagePayment;
