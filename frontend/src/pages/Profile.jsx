import React, { useState, useEffect } from 'react';
import Nav from '../components/chat/Nav';
import { useDispatch, useSelector } from 'react-redux';
import { uploadProfilePic } from '../features/auth/authSlice';
import { Pen } from 'lucide-react';
import { getInitials } from '../components/getInitial';
import Cropper from 'react-easy-crop';
import { getCroppedImgBlob } from '../utils/cropImage';
import ProfileDialog from '../components/ProfileDialog';

const Profile = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [localUser, setLocalUser] = useState(user);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setImage(file);
      setPreview(previewURL);
      setShowCrop(true);
    }
  };

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const uploadCroppedImage = async () => {
    const croppedBlob = await getCroppedImgBlob(
      preview,
      crop,
      zoom,
      croppedAreaPixels
    );
    const croppedFile = new File([croppedBlob], image.name, {
      type: 'image/jpeg',
    });

    dispatch(uploadProfilePic(croppedFile));
    setShowCrop(false);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <div className="flex flex-col items-center justify-center mt-16">
        <section className="bg-white rounded-3xl shadow-xl px-10 py-12 flex flex-col items-center w-full max-w-md">
          <header className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 mb-2 headFont">
              User Profile
            </h1>

            <div className="relative">
              {localUser?.profilePic ? (
                <img
                  src={`${BASE_URL}/${localUser.profilePic.replace(
                    /\\/g,
                    '/'
                  )}`}
                  alt="User Profile"
                  width={140}
                  height={140}
                  className="rounded-full shadow-lg object-cover transition-all duration-300"
                />
              ) : (
                <div className="w-[140px] h-[140px] rounded-full bg-purple-200 text-purple-800 flex items-center justify-center shadow-lg font-bold text-4xl uppercase transition-all duration-300">
                  {getInitials(localUser?.username || '')}
                </div>
              )}
              <label
                htmlFor="image-upload"
                className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-500 to-purple-800 text-white rounded-full p-2 shadow-md cursor-pointer hover:scale-105 transition"
                title="Change profile picture"
              >
                <Pen size={20} />
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <p className="mt-3 text-xs text-gray-400 bodyFont">
              Accepted: jpg, jpeg, png (max 5MB)
            </p>
          </header>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <div className="text-center my-6 space-y-1 bodyFont">
            <p className="text-2xl font-bold text-purple-800">
              {localUser?.username}
            </p>
            <p className="text-purple-500 text-sm">{localUser?.email}</p>
            <p className="text-xs text-purple-300">
              Joined on: {formatDate(localUser?.createdAt)}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="w-32 h-10 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-full shadow hover:scale-105 transition-all"
            >
              Edit Profile
            </button>
          </div>
        </section>
      </div>

      <ProfileDialog isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />

      {showCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-lg relative flex flex-col items-center p-4">
            <div className="relative w-full h-[400px] bg-gray-100">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="w-full flex flex-col gap-4 mt-6 z-10">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-between gap-4">
                <button
                  className="w-full py-2 rounded bg-gray-500 text-white font-semibold hover:bg-gray-600"
                  onClick={() => setShowCrop(false)}
                >
                  Cancel
                </button>
                <button
                  className="w-full py-2 rounded bg-purple-600 text-white font-semibold hover:bg-purple-700"
                  onClick={uploadCroppedImage}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Cropped'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
