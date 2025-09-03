import { Button } from "antd";
import type { LicenseItem } from "../../../stores/interfaces/License";

interface Props {
  record: LicenseItem;
  onRenew: (rec: LicenseItem) => void;
  onMakePayment: (rec: LicenseItem) => void;
}

const LicenseActionCell = ({ record, onRenew, onMakePayment }: Props) => {
  if (record.status === "waiting_for_payment") {
    return (
      <Button type="link" onClick={() => onMakePayment(record)}>
        Make payment
      </Button>
    );
  }
  return (
    <Button type="link" onClick={() => onRenew(record)}>
      Renew
    </Button>
  );
};

export default LicenseActionCell;
