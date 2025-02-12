"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings as SettingsIcon, Palette, Bell, Shield, User, Globe } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface TabProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab: React.FC<TabProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors
      ${isActive 
        ? "bg-primary text-foreground" 
        : "text-foreground hover:bg-accent"}`}
  >
    <Icon className="h-4 w-4" />
    <span>{label}</span>
  </button>
);

interface SettingsWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsWindow: React.FC<SettingsWindowProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("appearance");

  const tabs = [
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "language", label: "Language", icon: Globe },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-lg text-foreground font-medium">Theme</h3>
              <p className="mb-4 text-sm text-foreground">Choose your preferred theme</p>
              <ThemeToggle />
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-medium">Font Size</h3>
              <p className="mb-4 text-sm text-foreground">Adjust the application font size</p>
              <select className="w-full rounded-lg border border-divider bg-background p-2 " aria-label="select">
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
          </div>
        );
      case "account":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Account Settings</h3>
            <p className="text-sm text-foreground">Manage your account preferences</p>
          </div>
        );
      // Add other tab contents as needed
      default:
        return (
          <div className="text-center text-foreground">
            Content for {activeTab} tab
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-3xl bg-background p-6 rounded-lg shadow-xl sm:w-11/12 md:w-10/12 lg:w-8/12 xl:w-7/12">
              <div className="flex items-center justify-between border-b border-divider text-foreground pb-4">
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-foreground transition-colors hover:bg-accent"
                  aria-label="close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.id}
                    icon={tab.icon}
                    label={tab.label}
                    isActive={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                  />
                ))}
              </div>

              <div className="mt-6">{renderTabContent()}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsWindow;
