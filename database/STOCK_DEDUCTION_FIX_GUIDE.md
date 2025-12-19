# 🔧 FIXING STOCK DEDUCTION TIMING

## ❌ **THE PROBLEM**

Stock is being deducted **immediately** when an order is created (during checkout), even before payment is confirmed. This causes:

1. ❌ Customers see "Out of Stock" when items are just in pending orders
2. ❌ Stock is reserved for orders that might fail/expire
3. ❌ Race conditions when multiple customers checkout simultaneously

**Example:**
- Customer A adds Lenovo laptop to cart (Stock: 4)
- Customer A clicks "Pay with GCash" → Order created, **stock deducted to 3**
- Payment is pending... customer leaves without paying
- Stock is stuck at 3 even though laptop is still available!

---

## ✅ **THE SOLUTION**

Stock should only be deducted **AFTER payment is confirmed**, not during order creation.

### **Correct Flow:**
```
1. Order Created → Status: 'pending' → Stock: NOT TOUCHED (still available)
2. Payment Confirmed → Status: 'confirmed' → Stock: DEDUCTED
3. Order Cancelled → Status: 'cancelled' → Stock: RESTORED (if was confirmed)
4. Payment Failed → Status: 'cancelled' → Stock: NEVER DEDUCTED
```

---

## 📋 **HOW TO APPLY THE FIX**

### **Step 1: Run the Database Script**

1. Open Supabase SQL Editor
2. Run this file: `FIX_STOCK_DEDUCTION_ON_PAYMENT_CONFIRMATION.sql`
3. Verify success messages appear

This script will:
- ✅ Update `create_order_from_cart()` to NOT deduct stock during order creation
- ✅ Create trigger to deduct stock ONLY when payment is confirmed
- ✅ Update stock restoration to only restore if stock was actually deducted
- ✅ Auto-cancel orders when payments fail/expire

---

### **Step 2: Update Payment Confirmation Logic**

You need to update your payment webhook/confirmation handlers to properly update payment status.

#### **For GCash/PayMongo Payments:**

When you receive a webhook from PayMongo that payment succeeded:

```javascript
// In your webhook handler or payment confirmation
async function handlePaymentConfirmation(paymentIntentId) {
  try {
    // Get payment intent from PayMongo
    const paymentIntent = await paymongoAPI.retrievePaymentIntent(paymentIntentId);
    
    if (paymentIntent.attributes.status === 'succeeded') {
      // Update payment status in database
      const { error } = await supabase
        .from('payments')
        .update({
          payment_status: 'paid',  // ⭐ This triggers stock deduction!
          paid_at: new Date().toISOString(),
          paymongo_payment_intent_id: paymentIntent.id
        })
        .eq('transaction_id', transactionId);
      
      if (error) throw error;
      
      // ✅ Stock will be automatically deducted by the database trigger
      console.log('✅ Payment confirmed, stock deducted automatically');
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
  }
}
```

#### **For Cash on Delivery (COD):**

COD orders should remain `pending` until the admin confirms payment upon delivery:

```javascript
// In admin panel - when confirming COD payment received
async function confirmCODPayment(orderId) {
  const { error } = await supabase
    .from('payments')
    .update({
      payment_status: 'paid',  // ⭐ This triggers stock deduction!
      paid_at: new Date().toISOString()
    })
    .eq('order_id', orderId);
  
  if (!error) {
    console.log('✅ COD payment confirmed, stock deducted');
  }
}
```

---

### **Step 3: Handle Payment Failures**

Update your payment error handling:

```javascript
// When payment fails
async function handlePaymentFailure(transactionId, reason) {
  const { error } = await supabase
    .from('payments')
    .update({
      payment_status: 'failed',  // ⭐ This auto-cancels the order
      updated_at: new Date().toISOString()
    })
    .eq('transaction_id', transactionId);
  
  if (!error) {
    // ✅ Order automatically cancelled, stock never deducted
    console.log('❌ Payment failed, order cancelled, stock available');
  }
}
```

---

## 🧪 **TESTING THE FIX**

### **Test 1: GCash Payment Flow**
1. Add product to cart (Stock: 5)
2. Checkout with GCash → Order created
3. ✅ Check stock is still 5 (not deducted yet)
4. Complete payment → Payment confirmed
5. ✅ Check stock is now 4 (deducted after confirmation)

### **Test 2: Abandoned Cart**
1. Add product to cart (Stock: 5)
2. Checkout with GCash → Order created
3. ✅ Check stock is still 5
4. Leave without paying (payment expires)
5. ✅ Check stock is still 5 (never deducted)

### **Test 3: Order Cancellation**
1. Complete order with GCash → Stock deducted (5 → 4)
2. Cancel order
3. ✅ Check stock restored (4 → 5)

### **Test 4: Payment Failure**
1. Add product to cart (Stock: 5)
2. Checkout with GCash → Order created
3. ✅ Check stock is still 5
4. Payment fails
5. ✅ Order auto-cancelled, stock still 5

---

## 📊 **DATABASE CHANGES SUMMARY**

### **1. create_order_from_cart()**
- ❌ **Before:** `UPDATE products SET stock_quantity = stock_quantity - quantity`
- ✅ **After:** Stock checking only, no deduction

### **2. New Trigger: deduct_stock_on_payment_confirmation()**
- Triggered when: `payment_status` changes to `'paid'` or `'completed'`
- Action: Deducts stock + Updates order status to `'confirmed'`

### **3. Updated: restore_stock_on_cancel()**
- Only restores stock if order was `'confirmed'` (stock was actually deducted)
- Ignores cancelled orders that were never confirmed

### **4. New Trigger: handle_payment_failure()**
- Triggered when: `payment_status` changes to `'failed'`, `'expired'`, or `'cancelled'`
- Action: Auto-cancels the order

---

## 🔐 **SECURITY NOTES**

1. ✅ All functions use `SECURITY DEFINER` to bypass RLS
2. ✅ Stock validation happens at multiple points
3. ✅ Transactions ensure atomic operations
4. ✅ Prevents negative stock values
5. ✅ Prevents double-deduction

---

## 📞 **WEBHOOK SETUP (PayMongo)**

Make sure your PayMongo webhook is configured to call your backend:

```javascript
// Webhook endpoint: /api/paymongo-webhook
app.post('/api/paymongo-webhook', async (req, res) => {
  const event = req.body.data;
  
  if (event.attributes.type === 'payment.paid') {
    const paymentIntentId = event.attributes.data.id;
    
    // Update payment status in Supabase
    await handlePaymentConfirmation(paymentIntentId);
  }
  
  res.json({ received: true });
});
```

---

## ✅ **VERIFICATION CHECKLIST**

After applying the fix:

- [ ] Run SQL script successfully
- [ ] Update payment webhook handler
- [ ] Test GCash payment flow
- [ ] Test payment failure flow
- [ ] Test order cancellation
- [ ] Test COD payment confirmation
- [ ] Verify stock numbers are correct
- [ ] Check admin panel shows correct stock levels

---

## 🎯 **EXPECTED RESULTS**

After this fix:

1. ✅ Stock only deducted when payment confirmed
2. ✅ Pending orders don't reserve stock
3. ✅ Failed payments don't affect stock
4. ✅ Cancelled orders restore stock (if was confirmed)
5. ✅ No more "Out of Stock" errors for available items

---

## 🆘 **TROUBLESHOOTING**

### **Stock still deducting immediately?**
- Make sure you ran the SQL script
- Check that `create_order_from_cart()` function was updated
- Verify trigger `trigger_deduct_stock_on_payment` exists

### **Stock not deducting after payment?**
- Check payment status is set to `'paid'` or `'completed'`
- Verify trigger is enabled: `SELECT * FROM pg_trigger WHERE tgname = 'trigger_deduct_stock_on_payment'`

### **Stock not restoring on cancellation?**
- Check order was `'confirmed'` before cancellation
- Verify trigger `trigger_restore_stock_on_cancel` exists

---

## 📧 **QUESTIONS?**

If you encounter issues, check:
1. Supabase logs for SQL errors
2. Browser console for API errors
3. Database triggers are enabled
4. Payment status values match expected values (`'paid'`, `'failed'`, etc.)
