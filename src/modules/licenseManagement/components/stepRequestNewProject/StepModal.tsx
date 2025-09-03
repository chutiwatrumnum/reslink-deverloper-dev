import { ReactNode } from "react";
// CSS
import "../../styles/stepModalCreate.css";
interface ModalPropsType {
  isOpen: boolean;
  onClose: () => void;
  header: ReactNode;
  children: ReactNode;
}
const StepModal = ({ isOpen, onClose, header, children }: ModalPropsType) => {
  if (!isOpen) return null;
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  const handleModalContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="modalOverlay" onClick={handleOverlayClick}>
      <div className="modalBody" onClick={handleModalContentClick}>
        {/* Modal Header */}
        <div className="modalHeader">
          <div>{header}</div>
        </div>
        {/* Modal Content */}
        <div className="modalContent">{children}</div>
      </div>
    </div>
  );
};

export default StepModal;
