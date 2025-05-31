import * as React from "react";
import PropTypes from "prop-types";
import { Stack } from "@mui/material";
import { Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { theme } from "../../theme/theme";
import ScrollToTop from "./ScrollToTop";

// Import all necessary components
import Dashboard from "../Dashboard/dashboard";
import Product from "../Product/Product";
import ProductCreate from "../Product/ProductComponents/ProductCreate";
import ProductView from "../Product/ProductComponents/ProductView";
import BundleCreate from "../Product/ProductComponents/BundleCreate";
import BundleView from "../Product/ProductComponents/BundleView";
import Order from "../Order/Order";
import Payment from "../Payment/Payment";
import Promotions from "../Promotions/Promotions";
import Shipping from "../Shipping/Shipping";
import Users from "../User/User";
import Feedback from "../Feedback/Feedback";
import Shipview from "../Shipping/Shipview";

const NAVIGATION = [
  { segment: "dashboard", title: "Dashboard", icon: <MdOutlineDashboard /> },
  { segment: "products", title: "Products", icon: <TbPackage /> },
  { segment: "users", title: "Users", icon: <FaUserGroup /> },
  { segment: "orders", title: "Orders", icon: <IoDocumentTextOutline /> },
  { segment: "payment", title: "Payment", icon: <FaRegCreditCard /> },
  { segment: "shipping", title: "Shipping", icon: <MdOutlineLocalShipping /> },
  { segment: "feedback", title: "Feedback", icon: <MdFeedback /> },
  { segment: "discount", title: "Discount", icon: <RiDiscountPercentFill /> },
];

function DashboardLayoutBasic(props) {
  const { window } = props;
  const navigate = useNavigate();

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
      signOut: () => {
        setSession(null);
        navigate("/auth");
      },
    }),
    [navigate]
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
              style={{ width: "100%", height: "auto", maxWidth: "150px" }}
            />
          ),
          title: (
            <span style={{ color: "#fff", fontWeight: 700 }}>
              EGIE Gameshop
            </span>
          ),
          homeUrl: "/dashboard",
        }}
        theme={theme}
        window={demoWindow}
      >
        <DashboardLayout>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Product />} />
            <Route path="/products/create" element={<ProductCreate />} />
            <Route path="/products/view" element={<ProductView />} />
            <Route path="/bundles/create" element={<BundleCreate />} />
            <Route path="/bundles/view" element={<BundleView />} />
            <Route path="/users" element={<Users />} />
            <Route path="/orders" element={<Order />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/shipping/view/:orderId" element={<Shipview />} />
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
