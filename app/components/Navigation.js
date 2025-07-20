"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { signOut } from "next-auth/react";
import Button from "./ui/Button";
import {
  HomeIcon,
  BeakerIcon,
  UsersIcon,
  DocumentTextIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const Navigation = ({ className = "" }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon,
      description: "Overview and analytics",
    },
    {
      name: "Trials",
      href: "/dashboard/trials",
      icon: BeakerIcon,
      description: "Manage clinical trials",
      subItems: [
        {
          name: "All Trials",
          href: "/dashboard/trials",
          description: "View all trials",
        },
        {
          name: "New Trial",
          href: "/dashboard/trials/new",
          description: "Create new trial",
        },
      ],
    },
    {
      name: "Participants",
      href: "/dashboard/participants",
      icon: UsersIcon,
      description: "Participant management",
    },
    {
      name: "Audit Log",
      href: "/dashboard/audit-log",
      icon: ClipboardDocumentListIcon,
      description: "System audit trail",
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: DocumentTextIcon,
      description: "Data and analytics",
    },
  ];

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={clsx(
        "bg-white border-r border-neutral-200 flex flex-col h-screen relative",
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <BeakerIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-neutral-900">Sparsh</h1>
                <p className="text-xs text-neutral-500">
                  Clinical Trials Portal
                </p>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-neutral-500" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="p-4 border-b border-neutral-200">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push("/dashboard/trials/new")}
            className="w-full justify-center"
          >
            New Trial
          </Button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.name}>
              <motion.button
                whileHover={{ x: collapsed ? 0 : 4 }}
                onClick={() => router.push(item.href)}
                className={clsx(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200",
                  {
                    "nav-link-active": active,
                    "nav-link-inactive": !active,
                  }
                )}
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-neutral-500 truncate">
                      {item.description}
                    </p>
                  </div>
                )}
              </motion.button>
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-neutral-200">
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          onClick={() => signOut()}
          className={clsx("w-full", {
            "justify-center": collapsed,
            "justify-start": !collapsed,
          })}
          title={collapsed ? "Sign Out" : undefined}
        >
          {!collapsed && "Sign Out"}
        </Button>
      </div>
    </motion.aside>
  );
};

export default Navigation;
