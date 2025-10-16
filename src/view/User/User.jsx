import React, { useState, useEffect } from "react";
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
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import AdminLogService from "../../services/AdminLogService";

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
  const { user: currentUser } = useAuth();
  const [employeesList, setEmployeesList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch users from database
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch all profiles from database
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database data to UI format
      const employees = [];
      const customers = [];

      data.forEach(user => {
        const transformedUser = {
          id: user.id,
          name: user.full_name || user.email?.split('@')[0] || 'Unknown',
          email: user.email,
          phoneNumber: user.phone_number || 'N/A',
          dateAdded: new Date(user.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          lastLogin: user.last_login 
            ? `Active ${new Date(user.last_login).toLocaleDateString()}`
            : 'Never',
          avatar: user.avatar_url || 'https://via.placeholder.com/40',
          access: [user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer'],
          role: user.role || 'customer',
          status: user.status || 'active',
          isBanned: user.is_banned || false,
        };

        // Separate employees and customers by role
        if (user.role === 'admin' || user.role === 'manager' || user.role === 'employee') {
          employees.push(transformedUser);
        } else {
          customers.push(transformedUser);
        }
      });

      setEmployeesList(employees);
      setCustomersList(customers);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Keep empty lists on error
    } finally {
      setLoading(false);
    }
  };
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

  const handleAddUser = async (newUser) => {
    // Refresh the users list from database
    await fetchUsers();
    setAddUserDrawerOpen(false);
  };

  const handlePromotionClick = () => {
    // Only admin can promote employees
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can promote employees');
      return;
    }

    const currentRole = getCurrentRole(selectedUser.access);
    const nextRole = getNextRole(currentRole);

    if (nextRole) {
      setPromotionRole(nextRole);
      setPromotionDialogOpen(true);
    }
  };

  const handlePromotionConfirm = async () => {
    if (selectedUser && promotionRole) {
      try {
        // Update role in database
        const { error } = await supabase
          .from('profiles')
          .update({ role: promotionRole.toLowerCase() })
          .eq('id', selectedUser.id);

        if (error) throw error;

        // Create activity log
        if (currentUser?.id) {
          await AdminLogService.createLog({
            userId: currentUser.id,
            actionType: 'user_promote',
            actionDescription: `Promoted ${selectedUser.name} to ${promotionRole}`,
            targetType: 'user',
            targetId: selectedUser.id,
            metadata: {
              oldRole: getCurrentRole(selectedUser.access),
              newRole: promotionRole,
            },
          });
        }

        // Update local state
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

        // Refresh user list
        await fetchUsers();
      } catch (error) {
        console.error('Error promoting user:', error);
        alert('Failed to promote user. Please try again.');
      }
    }
    setPromotionDialogOpen(false);
    setPromotionRole(null);
  };

  const handleDemotionClick = () => {
    // Only admin can demote employees
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can demote employees');
      return;
    }

    const currentRole = getCurrentRole(selectedUser.access);
    const previousRole = getPreviousRole(currentRole);

    if (previousRole) {
      setDemotionRole(previousRole);
      setDemotionDialogOpen(true);
    }
  };

  const handleDemotionConfirm = async () => {
    if (selectedUser && demotionRole) {
      try {
        // Update role in database
        const { error } = await supabase
          .from('profiles')
          .update({ role: demotionRole.toLowerCase() })
          .eq('id', selectedUser.id);

        if (error) throw error;

        // Create activity log
        if (currentUser?.id) {
          await AdminLogService.createLog({
            userId: currentUser.id,
            actionType: 'user_demote',
            actionDescription: `Demoted ${selectedUser.name} to ${demotionRole}`,
            targetType: 'user',
            targetId: selectedUser.id,
            metadata: {
              oldRole: getCurrentRole(selectedUser.access),
              newRole: demotionRole,
            },
          });
        }

        // Update local state
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

        // Refresh user list
        await fetchUsers();
      } catch (error) {
        console.error('Error demoting user:', error);
        alert('Failed to demote user. Please try again.');
      }
    }
    setDemotionDialogOpen(false);
    setDemotionRole(null);
  };

  const handleDeleteClick = () => {
    // Only admin can delete employees
    if (currentUser?.role !== 'admin') {
      alert('Only administrators can delete employees');
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      // Only admin can delete employees
      if (currentUser?.role !== 'admin') {
        alert('Only administrators can delete employees');
        return;
      }

      // Delete from database
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Create activity log
      await AdminLogService.createLog(
        currentUser.id,
        'delete_employee',
        `Deleted employee: ${selectedUser.name} (${selectedUser.email})`,
        'user',
        selectedUser.id,
        {
          deleted_user_name: selectedUser.name,
          deleted_user_email: selectedUser.email,
          deleted_user_role: selectedUser.role
        }
      );

      // Update UI
      setEmployeesList((prev) =>
        prev.filter((user) => user.email !== selectedUser.email)
      );
      setDeleteDialogOpen(false);
      setEmployeeDrawerOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    }
  };

  const handleBanClick = () => {
    setBanDialogOpen(true);
  };

  const handleBanConfirm = async () => {
    try {
      // Update user status to banned in database
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'banned' })
        .eq('id', selectedUser.id);

      if (error) throw error;

      // Create activity log
      await AdminLogService.createLog(
        currentUser.id,
        'ban_customer',
        `Banned customer: ${selectedUser.name} (${selectedUser.email})`,
        'user',
        selectedUser.id,
        {
          banned_user_name: selectedUser.name,
          banned_user_email: selectedUser.email
        }
      );

      // Update UI
      setCustomersList((prev) =>
        prev.filter((customer) => customer.email !== selectedUser.email)
      );
      setBanDialogOpen(false);
      setCustomerDrawerOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error banning customer:', error);
      alert('Failed to ban customer');
    }
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