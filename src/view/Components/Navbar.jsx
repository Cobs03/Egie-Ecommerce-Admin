import * as React from "react";
import PropTypes from "prop-types";
import { createTheme } from "@mui/material/styles";

import { Routes, Route, Navigate } from "react-router-dom";

import {
  MdOutlineDashboard,
  MdOutlineLocalShipping,
  MdFeedback,
} from "react-icons/md";
import { TbPackage } from "react-icons/tb";
import { FaUserGroup, FaRegCreditCard } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiDiscountPercentFill } from "react-icons/ri";

import { AppProvider } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { DemoProvider } from "@toolpad/core/internal";

import Dashboard from "../Dashboard/dashboard";
import Product from "../Product/Product";
import Order from "../Order/Order";
import Payment from "../Payment/Payment";
import Promotions from "../Promotions/Promotions";
import Shipping from "../Shipping/Shipping";
import Users from "../User/User";
import Feedback from "../Feedback/Feedback";

const NAVIGATION = [
  { kind: "header", title: "Main items" },
  { segment: "dashboard", title: "Dashboard", icon: <MdOutlineDashboard /> },
  { segment: "products", title: "Products", icon: <TbPackage /> },
  { segment: "users", title: "Users", icon: <FaUserGroup /> },
  { segment: "orders", title: "Orders", icon: <IoDocumentTextOutline /> },
  { segment: "payment", title: "Payment", icon: <FaRegCreditCard /> },
  { segment: "shipping", title: "Shipping", icon: <MdOutlineLocalShipping /> },
  { segment: "feedback", title: "Feedback", icon: <MdFeedback /> },
  { segment: "discount", title: "Discount", icon: <RiDiscountPercentFill /> },
];

const demoTheme = createTheme({
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: 280,
          transition: "width 0.2s ease-in-out",
        },
      },
    },
  },
  palette: {
    mode: "light",
    primary: { main: "#000000" },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: { light: true, dark: true },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 600, lg: 1200, xl: 1536 },
  },
});

function DashboardLayoutBasic(props) {
  const { window } = props;

  const [session, setSession] = React.useState({
    user: {
      name: "Bharat Kashyap",
      email: "bharatkashyap@outlook.com",
      image: "https://avatars.githubusercontent.com/u/19550456",
    },
  });

  const authentication = React.useMemo(
    () => ({
      signIn: () =>
        setSession({
          user: {
            name: "Bharat Kashyap",
            email: "bharatkashyap@outlook.com",
            image: "https://avatars.githubusercontent.com/u/19550456",
          },
        }),
      signOut: () => setSession(null),
    }),
    []
  );

  const demoWindow = window !== undefined ? window() : undefined;

  return (
    <DemoProvider window={demoWindow}>
      <AppProvider
        session={session}
        authentication={authentication}
        navigation={NAVIGATION}
        branding={{
          logo: (
            <img
              src="https://i.ibb.co/Cpx2BBt5/egie-removebg-preview-1.png"
              alt="EGIE Logo"
            />
          ),
          title: "EGIE Gameshop",
          homeUrl: "/dashboard",
        }}
        theme={demoTheme}
        window={demoWindow}
      >
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Product />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/discount" element={<Promotions />} />
          </Routes>
        </DashboardLayout>
      </AppProvider>
    </DemoProvider>
  );
}

DashboardLayoutBasic.propTypes = {
  window: PropTypes.func,
};

export default DashboardLayoutBasic;
