import React from 'react';
import { Modal, Button } from 'antd';

interface DeleteConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      centered
      closable={false}
      maskClosable={false}
      width={400}
      className="delete-confirm-modal"
      style={{
        borderRadius: '12px',
      }}
    >
      <div style={{ padding: '24px', textAlign: 'center' }}>
        {/* Title */}
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '16px',
          marginTop: '0'
        }}>
          {title}
        </h3>
        
        {/* Message */}
        <p style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '32px',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        
        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <Button
            onClick={onConfirm}
            className="
            !w-[150px]
              !bg-[#52c41a] 
              !border-[#52c41a] 
              !text-white 
              !rounded-[6px] 
              !font-medium 
              !min-w-[80px] 
              !h-[36px] 
              !shadow-none
            "
            onMouseEnter={(e) => {
              e.currentTarget.classList.add('!bg-[#73d13d]', '!border-[#73d13d]');
              e.currentTarget.classList.remove('!bg-[#52c41a]', '!border-[#52c41a]');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('!bg-[#73d13d]', '!border-[#73d13d]');
              e.currentTarget.classList.add('!bg-[#52c41a]', '!border-[#52c41a]');
            }}
          >
            Confirm
          </Button>
          
          <Button
            onClick={onCancel}
            className="
            !w-[150px]
            !bg-[#ff4d4f] !border-[#ff4d4f] !text-white !rounded-[6px] 
            !font-medium !min-w-[80px] !h-[36px] !shadow-none"
            onMouseEnter={(e) => {
              e.currentTarget.classList.add('!bg-[#ff7875]', '!border-[#ff7875]');
            }}
            onMouseLeave={(e) => {
              e.currentTarget.classList.remove('!bg-[#ff7875]', '!border-[#ff7875]');
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal; 