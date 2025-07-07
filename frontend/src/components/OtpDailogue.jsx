import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { toast } from 'react-toastify';

const OtpDailogue = ({ isOpen, onClose, onVerify, email }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 4) {
      return toast.error('Enter full OTP');
    }
    setLoading(true);
    await onVerify(enteredOtp);
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0">
      <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-60 p-4">
        <DialogPanel className="bg-white p-6 rounded-lg space-y-4 w-full max-w-md">
          <DialogTitle className="text-xl font-semibold text-purple-700">
            Enter the OTP sent to {email}
          </DialogTitle>

          <div className="flex gap-4 justify-center">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="w-12 h-12 text-center border border-gray-300 rounded-md text-xl"
              />
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={onClose} className="text-gray-500 hover:underline">
              Cancel
            </button>
            <button
              onClick={handleVerify}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default OtpDailogue;
