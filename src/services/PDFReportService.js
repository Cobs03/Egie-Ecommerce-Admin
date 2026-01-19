import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

/**
 * PDF Report Generation Service
 * Generates professional PDF reports for various business needs
 */
export class PDFReportService {
  
  // Helper function to format currency without special characters
  static formatCurrency(amount) {
    const num = Number(amount || 0);
    return 'PHP ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /**
   * Generate Sales Analytics PDF Report
   */
  static async generateSalesReport(data) {
    const { salesOverview, productPerformance, categoryPerformance, timeRange, startDate, endDate } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('SALES ANALYTICS REPORT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Period: ' + startDate + ' to ' + endDate, pageWidth / 2, yPos, { align: 'center' });
    doc.text('Generated: ' + new Date().toLocaleString(), pageWidth / 2, yPos + 5, { align: 'center' });
    
    yPos += 20;

    // Sales Overview Section
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Sales Overview', 14, yPos);
    yPos += 8;

    const overviewData = [
      ['Total Revenue', this.formatCurrency(salesOverview.totalRevenue)],
      ['Total Orders', (salesOverview.totalOrders || 0).toString()],
      ['Average Order Value', this.formatCurrency(salesOverview.avgOrderValue)],
      ['Top Product', salesOverview.topProduct?.name || 'N/A']
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: overviewData,
      theme: 'grid',
      headStyles: { fillColor: [0, 230, 118], textColor: 255 },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Product Performance Section
    if (productPerformance && productPerformance.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Top 10 Product Performance', 14, yPos);
      yPos += 8;

      const productData = productPerformance.slice(0, 10).map((product, index) => [
        (index + 1).toString(),
        product.name || 'Unknown',
        (product.unitsSold || 0).toString(),
        this.formatCurrency(product.revenue),
        (product.stock || 0).toString()
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Rank', 'Product', 'Units Sold', 'Revenue', 'Stock']],
        body: productData,
        theme: 'striped',
        headStyles: { fillColor: [0, 230, 118], textColor: 255 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 70 },
          2: { cellWidth: 25 },
          3: { cellWidth: 40 },
          4: { cellWidth: 20 }
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Category Performance Section
    if (categoryPerformance && categoryPerformance.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Category Performance', 14, yPos);
      yPos += 8;

      const categoryData = categoryPerformance.map(category => [
        category.name || 'Unknown',
        (category.productCount || 0).toString(),
        (category.totalSold || 0).toString(),
        this.formatCurrency(category.revenue)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Category', 'Products', 'Units Sold', 'Revenue']],
        body: categoryData,
        theme: 'grid',
        headStyles: { fillColor: [0, 230, 118], textColor: 255 },
        margin: { left: 14, right: 14 }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Page ' + i + ' of ' + pageCount, pageWidth / 2, 285, { align: 'center' });
    }

    // Save the PDF
    const fileName = 'sales_report_' + new Date().toISOString().split('T')[0] + '.pdf';
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Generate Financial PDF Report
   */
  static async generateFinancialReport(data) {
    const { revenue, expenses, orders, payments, timeRange, startDate, endDate } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('FINANCIAL REPORT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Period: ' + startDate + ' to ' + endDate, pageWidth / 2, yPos, { align: 'center' });
    doc.text('Generated: ' + new Date().toLocaleString(), pageWidth / 2, yPos + 5, { align: 'center' });
    
    yPos += 20;

    // Financial Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Summary', 14, yPos);
    yPos += 8;

    const totalRevenue = revenue || 0;
    const totalExpenses = expenses || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

    const summaryData = [
      ['Total Revenue', this.formatCurrency(totalRevenue)],
      ['Total Expenses', this.formatCurrency(totalExpenses)],
      ['Net Profit', this.formatCurrency(netProfit)],
      ['Profit Margin', profitMargin.toFixed(2) + '%']
    ];

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 80 }
      },
      margin: { left: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Payment Methods Breakdown
    if (payments && payments.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Methods Breakdown', 14, yPos);
      yPos += 8;

      const paymentData = payments.map(payment => [
        payment.method || 'Unknown',
        (payment.count || 0).toString(),
        this.formatCurrency(payment.amount),
        (payment.percentage || 0).toFixed(1) + '%'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Payment Method', 'Transactions', 'Amount', 'Share']],
        body: paymentData,
        theme: 'grid',
        headStyles: { fillColor: [0, 230, 118], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Order Status Breakdown
    if (orders && orders.length > 0) {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Order Status Summary', 14, yPos);
      yPos += 8;

      const orderData = orders.map(order => [
        order.status || 'Unknown',
        (order.count || 0).toString(),
        this.formatCurrency(order.total)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Status', 'Orders', 'Total Value']],
        body: orderData,
        theme: 'striped',
        headStyles: { fillColor: [0, 230, 118], textColor: 255 },
        margin: { left: 14, right: 14 }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Page ' + i + ' of ' + pageCount, pageWidth / 2, 285, { align: 'center' });
    }

    // Save the PDF
    const fileName = 'financial_report_' + new Date().toISOString().split('T')[0] + '.pdf';
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Generate Inventory PDF Report
   */
  static async generateInventoryReport(data) {
    const { products, lowStockItems, outOfStockItems, timeRange, startDate, endDate } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('INVENTORY REPORT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Generated: ' + new Date().toLocaleString(), pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 20;

    // Inventory Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Inventory Summary', 14, yPos);
    yPos += 8;

    const totalProducts = products?.length || 0;
    const lowStock = lowStockItems?.length || 0;
    const outOfStock = outOfStockItems?.length || 0;
    const healthyStock = totalProducts - lowStock - outOfStock;

    const summaryData = [
      ['Total Products', totalProducts.toString()],
      ['Healthy Stock', healthyStock.toString()],
      ['Low Stock Items', lowStock.toString()],
      ['Out of Stock', outOfStock.toString()]
    ];

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 40 }
      },
      margin: { left: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Low Stock Alert
    if (lowStockItems && lowStockItems.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Low Stock Alert', 14, yPos);
      yPos += 8;

      const lowStockData = lowStockItems.slice(0, 20).map(item => [
        item.name || 'Unknown',
        item.sku || 'N/A',
        (item.stock || 0).toString(),
        this.formatCurrency(item.price)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'SKU', 'Stock', 'Price']],
        body: lowStockData,
        theme: 'grid',
        headStyles: { fillColor: [255, 152, 0], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Out of Stock Items
    if (outOfStockItems && outOfStockItems.length > 0) {
      if (yPos > 200) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Out of Stock Items', 14, yPos);
      yPos += 8;

      const outOfStockData = outOfStockItems.slice(0, 20).map(item => [
        item.name || 'Unknown',
        item.sku || 'N/A',
        this.formatCurrency(item.price)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'SKU', 'Price']],
        body: outOfStockData,
        theme: 'grid',
        headStyles: { fillColor: [244, 67, 54], textColor: 255 },
        margin: { left: 14, right: 14 }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Page ' + i + ' of ' + pageCount, pageWidth / 2, 285, { align: 'center' });
    }

    // Save the PDF
    const fileName = 'inventory_report_' + new Date().toISOString().split('T')[0] + '.pdf';
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Generate Customer Analytics PDF Report
   */
  static async generateCustomerReport(data) {
    const { customers, topCustomers, timeRange, startDate, endDate } = data;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('CUSTOMER ANALYTICS REPORT', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Period: ' + startDate + ' to ' + endDate, pageWidth / 2, yPos, { align: 'center' });
    doc.text('Generated: ' + new Date().toLocaleString(), pageWidth / 2, yPos + 5, { align: 'center' });
    
    yPos += 20;

    // Customer Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Overview', 14, yPos);
    yPos += 8;

    const summaryData = [
      ['Total Customers', (customers?.totalCustomers || 0).toString()],
      ['New Customers', (customers?.newCustomers || 0).toString()],
      ['Active Customers', (customers?.activeCustomers || 0).toString()],
      ['Average Lifetime Value', this.formatCurrency(customers?.avgLifetimeValue || 0)]
    ];

    autoTable(doc, {
      startY: yPos,
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { halign: 'right', cellWidth: 80 }
      },
      margin: { left: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Top Customers
    if (topCustomers && topCustomers.length > 0) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Top 10 Customers', 14, yPos);
      yPos += 8;

      const customerData = topCustomers.slice(0, 10).map((customer, index) => [
        (index + 1).toString(),
        customer.name || 'Unknown',
        (customer.orders || 0).toString(),
        this.formatCurrency(customer.totalSpent),
        this.formatCurrency(customer.avgOrderValue)
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Rank', 'Customer', 'Orders', 'Total Spent', 'Avg Order']],
        body: customerData,
        theme: 'striped',
        headStyles: { fillColor: [0, 230, 118], textColor: 255 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 60 },
          2: { cellWidth: 20 },
          3: { cellWidth: 40 },
          4: { cellWidth: 40 }
        }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, 'normal');
      doc.text('Page ' + i + ' of ' + pageCount, pageWidth / 2, 285, { align: 'center' });
    }

    // Save the PDF
    const fileName = 'customer_report_' + new Date().toISOString().split('T')[0] + '.pdf';
    doc.save(fileName);

    return { success: true, fileName };
  }
}

export default PDFReportService;
