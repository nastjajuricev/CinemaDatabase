"use client"

import Link from "next/link"
import { useFilmDatabase } from "@/app/providers"
import { useRouter } from "next/navigation"
import { Search, PlusCircle, Settings } from "lucide-react"

type NavigationBarProps = {
  active: "home" | "search" | "add" | "library" | "logout" | "settings"
}

export default function NavigationBar({ active }: NavigationBarProps) {
  const { logout } = useFilmDatabase()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black dark:bg-gray-900 h-14 sm:h-16 flex items-center justify-around z-50">
      <Link href="/dashboard/add">
        <div className="flex flex-col items-center">
          <PlusCircle
            size={20}
            className={`nav-icon ${
              active === "add" ? "nav-icon-active stroke-coral" : "nav-icon-default stroke-white"
            } hover:stroke-lime-green transition-colors sm:h-6 sm:w-6`}
          />
        </div>
      </Link>

      <Link href="/dashboard/search">
        <div className="flex flex-col items-center">
          <Search
            size={20}
            className={`nav-icon ${
              active === "search" ? "nav-icon-active stroke-coral" : "nav-icon-default stroke-white"
            } hover:stroke-lime-green transition-colors sm:h-6 sm:w-6`}
          />
        </div>
      </Link>

      <Link href="/dashboard">
        <div className="flex flex-col items-center">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center nav-icon ${
              active === "home" ? "bg-coral nav-icon-active" : "nav-icon-default"
            } hover:bg-lime-green transition-colors p-1`}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 48 49"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="scale-90"
            >
              <g clipPath="url(#clip0_72_930)">
                <path
                  d="M42.7061 32.4708C43.6428 30.283 44.2005 27.9578 44.4237 25.5826L47.9136 25.7818C48.034 25.8654 47.9968 26.2751 47.9872 26.427C47.9295 27.3595 47.6759 28.5871 47.4691 29.5105C47.1382 30.9872 46.65 32.4558 46.025 33.8334L42.7061 32.4708Z"
                  fill="white"
                />
                <path
                  d="M15.8067 42.8872L14.4077 46.2458C12.4832 45.4115 10.5151 44.2939 8.89336 42.9576C8.73154 42.8244 8.12793 42.3575 8.12793 42.1993C8.12793 42.0228 10.1715 39.845 10.4919 39.5945C12.1319 40.8816 13.8391 42.1415 15.8072 42.8872H15.8067Z"
                  fill="white"
                />
                <path
                  d="M5.08753 16.1433C4.32665 18.1539 3.75986 20.2317 3.56759 22.3841L0 21.989C0.195902 19.5374 0.774062 17.0981 1.76357 14.8494L5.08753 16.1438V16.1433Z"
                  fill="white"
                />
                <path
                  d="M37.3311 8.44224C37.1329 8.55727 36.1698 7.67658 35.9284 7.5079C34.6198 6.59357 33.239 5.81792 31.7754 5.1732L33.1085 1.89417C34.9085 2.53979 36.7084 3.5696 38.2497 4.70581C38.4315 4.83993 39.4083 5.5583 39.4683 5.6506C39.5237 5.73653 39.5242 5.80791 39.4669 5.89157L37.3315 8.44224H37.3311Z"
                  fill="white"
                />
                <path
                  d="M44.5369 11.5062C45.7359 13.6313 46.7836 15.8619 47.3354 18.2534L47.0463 18.4399L43.8769 19.1882C43.3001 17.1491 42.5083 15.1963 41.4238 13.374L41.5056 13.2189L44.1669 11.5571L44.5369 11.5062Z"
                  fill="white"
                />
                <path
                  d="M28.3761 44.162L29.0897 47.6729C26.6848 48.2067 24.1399 48.4413 21.6909 48.0885L22.0514 44.5953C23.2804 44.5689 24.4585 44.6648 25.6976 44.5598C26.6003 44.483 27.4843 44.307 28.3761 44.162Z"
                  fill="white"
                />
                <path
                  d="M39.2359 37.8445C39.5904 38.0509 41.9308 40.0887 41.8999 40.2669C40.2299 42.1015 38.2914 43.6533 36.1828 44.9532L34.3179 41.8783C36.1051 40.7121 37.7691 39.3985 39.2359 37.8445Z"
                  fill="white"
                />
                <path
                  d="M8.59777 10.6842L8.21369 10.5714L5.73242 8.41356C7.37372 6.52625 9.27092 4.82535 11.4536 3.58093L13.318 6.57262C12.3599 7.34828 11.2931 7.98936 10.37 8.8123C9.75727 9.35881 9.10684 10.0535 8.59777 10.6832V10.6842Z"
                  fill="white"
                />
                <path
                  d="M0.532715 29.5163L3.97122 28.7416C4.58483 30.7412 5.19936 32.7694 6.35931 34.5285L6.33613 34.634L3.24579 36.4395C2.01857 34.2862 0.968607 31.9747 0.532715 29.5163Z"
                  fill="white"
                />
                <path
                  d="M19.1758 4.21111L18.3745 0.688829C19.7254 0.416485 21.1153 0.124591 22.4975 0.0482075C23.2943 0.00410511 24.6065 -0.033632 25.3779 0.0477529C25.5479 0.0654848 25.722 0.101858 25.8642 0.202793C25.7074 1.34946 25.7774 2.58432 25.5033 3.69552C24.6665 3.67415 23.8175 3.60641 22.978 3.65097C21.7021 3.71871 20.4263 3.98151 19.1758 4.21111Z"
                  fill="white"
                />
                {/* Modified path: Changed the "C" to a circle */}
                <path
                  d="M23.8967 6.38672C14.0607 6.38672 6.0874 14.3624 6.0874 24.2014C6.0874 34.0403 14.0607 42.016 23.8967 42.016C33.7327 42.016 41.7061 34.0403 41.7061 24.2014C41.7061 14.3624 33.7327 6.38672 23.8967 6.38672Z"
                  fill="white"
                />
                {/* Add a circle in the center */}
                <circle cx="24" cy="24" r="8" fill="white" />
              </g>
              <defs>
                <clipPath id="clip0_72_930">
                  <rect width="48" height="48.2567" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </Link>

      <Link href="/dashboard/library">
        <div className="flex flex-col items-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={`nav-icon ${
              active === "library" ? "nav-icon-active fill-coral" : "nav-icon-default fill-white"
            } hover:fill-lime-green transition-colors`}
          >
            <path d="M17.5,3.5H6.5a-4.09,4.09,0,0,0-4.09,4.09V18.41A4.09,4.09,0,0,0,6.5,22.5h11a4.09,4.09,0,0,0,4.09-4.09V7.59A4.09,4.09,0,0,0,17.5,3.5h0ZM18.13,17.5V15.45h2.05v2.05H18.13Zm0-5.42h2.05V14.1H18.13V12.08ZM20.18,10.7H18.13V8.65h2.05V10.7ZM20.15,7.3h-2v-2.3a3.06,3.06,0,0,1,2,2.3ZM16.75,12.4H7.2V4.9h9.55V12.4ZM5.85,14.09H3.8V12.08H5.85v2Zm0-3.39H3.8V8.65H5.85V10.7ZM3.8,15.45H5.85V17.5H3.8V15.45ZM5.85,5v2.3h-2A3.06,3.06,0,0,1,5.85,5ZM3.83,18.85h2v2.3A3.06,3.06,0,0,1,3.83,18.85ZM7.2,13.75h9.55v7.5H7.2v-7.5Zm11.93,7.4v-2.3h2A3.06,3.06,0,0,1,19.13,21.15Z" />
          </svg>
        </div>
      </Link>

      <Link href="/dashboard/settings">
        <div className="flex flex-col items-center">
          <Settings
            size={20}
            className={`nav-icon ${
              active === "settings" || active === "logout"
                ? "nav-icon-active stroke-coral"
                : "nav-icon-default stroke-white"
            } hover:stroke-lime-green transition-colors sm:h-6 sm:w-6`}
          />
        </div>
      </Link>
    </div>
  )
}

