export const paymentData = [
  {
    orderId: "T425858300",
    transactionId: "T425858300",
    dateTime: "Dec 25, 2025 | 10:12pm",
    amount: "₱29,545.00",
    method: "Cash on Delivery (COD)",
    status: "Paid",
  },
  {
    orderId: "T425858301",
    transactionId: "T425858301",
    dateTime: "Dec 25, 2025 | 10:12pm",
    amount: "₱29,545.00",
    method: "Cash on Delivery (COD)",
    status: "Pending",
  },
  {
    orderId: "T425858302",
    transactionId: "T425858302",
    dateTime: "Dec 25, 2025 | 10:12pm",
    amount: "₱29,545.00",
    method: "Cash on Delivery (COD)",
    status: "Failed",
  },
];

export const statusColors = {
  Paid: "success",
  Pending: "warning",
  Failed: "error",
};

export const payerInfo = {
  name: "Mik ko",
  email: "mikko@gmail.com",
  phone: "(+63) 9185498421",
  address:
    "Blk 69 LOT 96, Dyan Lang Sa Gedli Ng Kanto, Poblacion, Santa Maria, North Luzon, Bulacan 3022",
};

export const mockOrder = {
  id: "ORD001",
  customer: {
    name: "Mik ko",
    email: "mikko@gmail.com",
    avatar: "https://via.placeholder.com/40",
  },
  products: [
    {
      name: "Gaming Mouse",
      quantity: 2,
      price: 2999.99,
      image: "https://via.placeholder.com/40",
      inventory: 15,
    },
    {
      name: "Mechanical Keyboard",
      quantity: 1,
      price: 4999.99,
      image: "https://via.placeholder.com/40",
      inventory: 3,
    },
  ],
  total: 10999.97,
  status: "New",
  date: "2025-12-25",
  shippingAddress:
    "Blk 69 LOT 96, Dyan Lang Sa Gedli Ng Kanto, Poblacion, Santa Maria, North Luzon, Bulacan 3022",
  deliveryType: "delivery",
};