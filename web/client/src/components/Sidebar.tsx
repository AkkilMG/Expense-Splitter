import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  HomeIcon,
  XIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/outline";
import Logo from "components/Logo";
import LinkedIn from "../images/Linkedin.png";
import Github from "../images/GitHub_Logo.png";
import Hashnode from "../images/hashnode.png";
import { classNames } from "utils";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ sidebarOpen, setSidebarOpen }: any) => {
  const [navigation, setNavigation] = useState([
    { name: "Home", href: "/", icon: HomeIcon, current: false },
    { name: "Groups", href: "/groups", icon: UserGroupIcon, current: false },
  ]);
  const { pathname } = useLocation();
  useEffect(() => {
    const updatePathName = pathname.split("/")[1].toLowerCase();

    setNavigation(
      navigation.map((item) => {
        if (
          item.name.toLowerCase() === updatePathName ||
          (pathname === "/" && item.name.toLowerCase() === "home") ||
          ((updatePathName === "group" || updatePathName === "addgroup") &&
            item.name.toLowerCase() === "groups")
        ) {
          item.current = true;
        } else {
          item.current = false;
        }

        return item;
      })
    );
  }, [pathname]);
  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 flex lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 pt-2 -mr-12">
                  <button
                    type="button"
                    className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="w-6 h-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="flex items-center flex-shrink-0 px-4">
                <Logo />
              </div>
              <nav
                className="flex-1 flex-shrink-0 mt-20 overflow-y-auto divide-y divide-gray-300"
                aria-label="Sidebar"
              >
                <div className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? "bg-blue-600 text-white"
                          : " text-gray-800 hover:bg-gray-200",
                        "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      <item.icon
                        className={classNames(
                          item.current
                            ? "mr-4 h-6 w-6 flex-shrink-0"
                            : "mr-4 h-6 w-6 flex-shrink-0 text-zinc-600"
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true"></div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-300">
          <div className="flex items-center flex-shrink-0 px-4">
            <Logo />
          </div>
          <nav
            className="flex flex-col flex-1 mt-20 overflow-y-auto divide-y divide-blue-800"
            aria-label="Sidebar"
          >
            <div className="px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? "bg-blue-600 text-white"
                      : "text-gray-800 hover:bg-gray-200",
                    "group flex items-center rounded-md px-2 py-2 text-sm font-medium leading-6"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  <item.icon
                    className={classNames(
                      item.current
                        ? "mr-4 h-6 w-6 flex-shrink-0"
                        : "mr-4 h-6 w-6 flex-shrink-0 text-zinc-600"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
