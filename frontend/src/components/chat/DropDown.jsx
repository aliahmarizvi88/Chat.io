import React from 'react';
import { Menu } from '@headlessui/react';
import { Trash2, Ban, MoreVertical } from 'lucide-react';

const DropDown = ({ onClearChat, onBlockUser, isBlocked }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="p-2 text-gray-600 hover:text-purple-700">
        <MoreVertical color="#ffff" className="hover: text-purple-300" />
      </Menu.Button>

      <Menu.Items className="absolute right-0 z-10 mt-2 w-44 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg focus:outline-none">
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onClearChat}
                className={`${
                  active ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat
              </button>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <button
                onClick={onBlockUser}
                className={`${
                  active ? 'bg-red-100 text-red-600' : 'text-gray-700'
                } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
              >
                <Ban className="mr-2 h-4 w-4" />
                {isBlocked ? 'Unblock User' : 'Block User'}
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  );
};

export default DropDown;
