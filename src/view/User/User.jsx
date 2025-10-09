import React, { useState } from "react";
import { Box } from "@mui/material";
import UserHeader from "./User Components/UserHeader";
import EmployeeTable from "./User Components/EmployeeTable";
import CustomerTable from "./User Components/CustomerTable";
import ManageUserDrawer from "./User Components/ManageUserDrawer";
import ManageCustomerDrawer from "./User Components/ManageCustomerDrawer";
import AddUserDrawer from "./User Components/AddUserDrawer";
import PromotionDialog from "./User Components/PromotionDialog";
import DeleteUserDialog from "./User Components/DeleteUserDialog";
import DemotionDialog from "./User Components/DemotionDialog";
import BanCustomerDialog from "./User Components/BanCustomerDialog";

const initialEmployees = [
  {
    name: "Mik ko",
    email: "mikko@gmail.com",
    dateAdded: "April 5, 1972",
    lastLogin: "Active Now",
    access: ["Admin"],
    avatar: "https://via.placeholder.com/40",
  },
  {
    name: "Geofferson Co",
    email: "geofferson@gmail.com",
    dateAdded: "April 5, 1972",
    lastLogin: "Active yesterday",
    access: ["Manager"],
    avatar: "https://via.placeholder.com/40",
  },
  {
    name: "Mark Tuplano Co",
    email: "marktuplano@gmail.com",
    dateAdded: "April 5, 1972",
    lastLogin: "Active last month",
    access: ["Employee"],
    avatar: "https://via.placeholder.com/40",
  },
];

const initialCustomers = [
  {
    name: "Mik ko",
    email: "mikko2@gmail.com",
    phoneNumber: "(+63) 9184548421",
    dateAdded: "April 5, 1972",
    lastLogin: "Active Now",
    avatar: "https://via.placeholder.com/40",
  },
  {
    name: "Geofferson Co",
    email: "geofferson@gmail.com",
    phoneNumber: "(+63) 9184548421",
    dateAdded: "April 5, 1972",
    lastLogin: "",
    avatar: "https://via.placeholder.com/40",
  },
  {
    name: "Mark Tuplano Co",
    email: "eocoin@gmail.com",
    phoneNumber: "(+63) 9184548421",
    dateAdded: "April 5, 1972",
    lastLogin: "Active last month",
    avatar: "https://via.placeholder.com/40",
  },
];

const User = () => {
  const [employeesList, setEmployeesList] = useState(initialEmployees);
  const [customersList, setCustomersList] = useState(initialCustomers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEmployeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const [isCustomerDrawerOpen, setCustomerDrawerOpen] = useState(false);
  const [isAddUserDrawerOpen, setAddUserDrawerOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [demotionDialogOpen, setDemotionDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [promotionRole, setPromotionRole] = useState(null);
  const [demotionRole, setDemotionRole] = useState(null);
  const [employeePage, setEmployeePage] = useState(0);
  const [customerPage, setCustomerPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [activeTab, setActiveTab] = useState("employees");
  const [searchQuery, setSearchQuery] = useState("");

  const roleHierarchy = ["Employee", "Manager", "Admin"];

  const getCurrentRole = (roles) => {
    if (roles.includes("Admin")) return "Admin";
    if (roles.includes("Manager")) return "Manager";
    return "Employee";
  };

  const getNextRole = (currentRole) => {
    const currentIndex = roleHierarchy.indexOf(currentRole);
    if (currentIndex < roleHierarchy.length - 1) {
      return roleHierarchy[currentIndex + 1];
    }
    return null;
  };

  const getPreviousRole = (currentRole) => {
    const currentIndex = roleHierarchy.indexOf(currentRole);
    if (currentIndex > 0) {
      return roleHierarchy[currentIndex - 1];
    }
    return null;
  };

  const handleEmployeeClick = (user) => {
    setSelectedUser(user);
    setEmployeeDrawerOpen(true);
  };

  const handleCustomerClick = (customer) => {
    setSelectedUser(customer);
    setCustomerDrawerOpen(true);
  };

  const handleAddUser = (newUser) => {
    if (activeTab === "employees") {
      setEmployeesList((prev) => [...prev, newUser]);
    } else {
      setCustomersList((prev) => [...prev, newUser]);
    }
  };

  const handlePromotionClick = () => {
    const currentRole = getCurrentRole(selectedUser.access);
    const nextRole = getNextRole(currentRole);

    if (nextRole) {
      setPromotionRole(nextRole);
      setPromotionDialogOpen(true);
    }
  };

  const handlePromotionConfirm = () => {
    if (selectedUser && promotionRole) {
      const updatedEmployees = employeesList.map((user) => {
        if (user.email === selectedUser.email) {
          return {
            ...user,
            access: [promotionRole],
          };
        }
        return user;
      });

      setEmployeesList(updatedEmployees);

      const updatedUser = {
        ...selectedUser,
        access: [promotionRole],
      };
      setSelectedUser(updatedUser);
    }
    setPromotionDialogOpen(false);
    setPromotionRole(null);
  };

  const handleDemotionClick = () => {
    const currentRole = getCurrentRole(selectedUser.access);
    const previousRole = getPreviousRole(currentRole);

    if (previousRole) {
      setDemotionRole(previousRole);
      setDemotionDialogOpen(true);
    }
  };

  const handleDemotionConfirm = () => {
    if (selectedUser && demotionRole) {
      const updatedEmployees = employeesList.map((user) => {
        if (user.email === selectedUser.email) {
          return {
            ...user,
            access: [demotionRole],
          };
        }
        return user;
      });

      setEmployeesList(updatedEmployees);

      const updatedUser = {
        ...selectedUser,
        access: [demotionRole],
      };
      setSelectedUser(updatedUser);
    }
    setDemotionDialogOpen(false);
    setDemotionRole(null);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setEmployeesList((prev) =>
      prev.filter((user) => user.email !== selectedUser.email)
    );
    setDeleteDialogOpen(false);
    setEmployeeDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleBanClick = () => {
    setBanDialogOpen(true);
  };

  const handleBanConfirm = () => {
    setCustomersList((prev) =>
      prev.filter((customer) => customer.email !== selectedUser.email)
    );
    setBanDialogOpen(false);
    setCustomerDrawerOpen(false);
    setSelectedUser(null);
  };

  const filteredEmployees = employeesList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCustomers = customersList.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadFile = () => {
    console.log("Downloading user data...");
  };

  return (
    <Box p={4}>
      <UserHeader
        onAddUser={() => setAddUserDrawerOpen(true)}
        onDownload={handleDownloadFile}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {activeTab === "employees" ? (
        <EmployeeTable
          users={filteredEmployees}
          page={employeePage}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setEmployeePage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setEmployeePage(0);
          }}
          onUserClick={handleEmployeeClick}
        />
      ) : (
        <CustomerTable
          customers={filteredCustomers}
          page={customerPage}
          rowsPerPage={rowsPerPage}
          onPageChange={(event, newPage) => setCustomerPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setCustomerPage(0);
          }}
          onCustomerClick={handleCustomerClick}
        />
      )}

      {/* Employee Drawer */}
      <ManageUserDrawer
        open={isEmployeeDrawerOpen}
        onClose={() => setEmployeeDrawerOpen(false)}
        user={selectedUser}
        onPromote={handlePromotionClick}
        onDemote={handleDemotionClick}
        onDelete={handleDeleteClick}
      />

      {/* Customer Drawer */}
      <ManageCustomerDrawer
        open={isCustomerDrawerOpen}
        onClose={() => setCustomerDrawerOpen(false)}
        customer={selectedUser}
        onBan={handleBanClick}
      />

      <AddUserDrawer
        open={isAddUserDrawerOpen}
        onClose={() => setAddUserDrawerOpen(false)}
        onAddUser={handleAddUser}
      />

      <PromotionDialog
        open={promotionDialogOpen}
        onClose={() => setPromotionDialogOpen(false)}
        onConfirm={handlePromotionConfirm}
        userName={selectedUser?.name}
        newRole={promotionRole}
      />

      <DemotionDialog
        open={demotionDialogOpen}
        onClose={() => setDemotionDialogOpen(false)}
        onConfirm={handleDemotionConfirm}
        userName={selectedUser?.name}
        roleToRemove={demotionRole}
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        userName={selectedUser?.name}
      />

      <BanCustomerDialog
        open={banDialogOpen}
        onClose={() => setBanDialogOpen(false)}
        onConfirm={handleBanConfirm}
        customerName={selectedUser?.name}
      />
    </Box>
  );
};

export default User;