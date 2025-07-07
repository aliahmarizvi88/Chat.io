import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from '../features/auth/authSlice';
import { Dialog } from '@headlessui/react';
import { toast } from 'react-toastify';

const ProfileDialog = ({ isOpen, setIsOpen }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [field, setField] = useState('');
  const [value, setValue] = useState('');

  const handleUpdate = async () => {
    const result = await dispatch(updateUser({ [field]: value }));
    if (updateUser.fulfilled.match(result)) {
      toast.success('Profile updated successfully');
      setIsOpen(false);
    } else {
      toast.error(result.payload);
    }
  };

  const resetDialog = () => {
    setStep(0);
    setField('');
    setValue('');
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed z-50 inset-0 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-purple-200 rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
            <Dialog.Title className="text-xl font-bold text-purple-700">
              {step === 0
                ? 'What would you like to update?'
                : 'Update Information'}
            </Dialog.Title>

            {step === 0 ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setField('username');
                    setStep(1);
                  }}
                  className="w-full py-2 px-4 bg-purple-100 rounded-lg hover:bg-purple-200"
                >
                  Username
                </button>
                <button
                  onClick={() => {
                    setField('email');
                    setStep(1);
                  }}
                  className="w-full py-2 px-4 bg-purple-100 rounded-lg hover:bg-purple-200"
                >
                  Email
                </button>
                <button
                  onClick={() => {
                    setField('password');
                    setStep(1);
                  }}
                  className="w-full py-2 px-4 bg-purple-100 rounded-lg hover:bg-purple-200"
                >
                  Password
                </button>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-gray-500 hover:underline"
                  >
                    Cancel
                  </button>
                  {/* </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleNext}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    Next
                  </button> */}
                </div>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  New {field}
                </label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={resetDialog}
                    className="text-sm px-4 py-2 bg-gray-200 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="text-sm px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Update
                  </button>
                </div>
              </>
            )}
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default ProfileDialog;
