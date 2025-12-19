Payment Intent Resource
A Payment Intent resource is used to track and handle different states of the payment until it succeeds. To learn how to use the Payment Intent, you can check the Payment Intent workflow.

A Payment Intent Resource
JSON

{
    "data": {
        "id": "pi_1JvFbEiRRnh2fsUE5nJ2F1z7",
        "type": "payment_intent",
        "attributes": {
            "amount": 2000,
            "currency": "PHP",
            "description": "Order # 20190604",
            "statement_descriptor": "The Barkery Shop",
            "status": "awaiting_payment_method",
            "livemode": false,
            "client_key": "pi_1JvFbEiRRnh2fsUE5nJ2F1z7_client_mpe6tJkgaX3pSoiYeSp1AbEU",
            "created_at": 1586179682,
            "updated_at": 1586179682,
            "last_payment_error": null,
            "payment_method_allowed": [
                "card"
            ],
            "payments": [],
            "next_action": null,
            "payment_method_options": {
                "card": {
                    "request_three_d_secure": "any"
                }
            },
            "metadata": {
                "yet_another_metadata": "good metadata",
                "reference_number": "X1999"
            }
        }
    }
}
id string
Unique ID of the resource.

type string
Represents the resource type. Value is always payment_intent.

amount integer
amount to be collected by the PaymentIntent. A positive integer with a minimum amount is 2000. 2000 is the smallest unit in cents. If you want to receive an amount of 20.00, the value that you should pass is 2000. If you want to receive an amount of 1500.50, the value that you should pass is 150050.

currency string
Three-letter ISO currency code, in uppercase. PHP is the only supported currency at the moment.

description string
Description of the payment intent. The value saved here will also be saved to the Payments resource that will be generated on attach PaymentMethod to PaymentIntent endpoint.

statement_descriptor string
You can use this value as the complete description that appears on your customer’s statements. Your account's business name is the default value if not passed.

status string
Status of the PaymentIntent. Possible values are awaiting_payment_method, awaiting_next_action, processing and succeeded.

livemode boolean
The value is true if the resource exists in live mode or the value is false if the resource exists in test mode.

client_key string
The client key of the PaymentIntent. This is used to retrieve a PaymentIntent from the client side using your public key. The client key is also used to attach the PaymentMethod to PaymentIntent from the client side.

Refer to our docs to accept card payment and learn about how client_key should be handled.

capture_type string
Sets the capture type of the transaction. The default value is automatic. You can use our Pre-authorization and Capture API by setting this field to manual.

last_payment_error dictionary
The last payment error encountered from the latest PaymentMethod attachment to PaymentIntent. This attribute is only available if the latest attachment had an error.

payment_method_allowed array
The list of payment method types that the PaymentIntent is allowed to use.

payments array
Payments that were created by the PaymentIntent. The payments attribute can only be queried using the secret key. Retrieving the PaymentIntent using the public key will not return this attribute for security purposes.

next_action dictionary
This attribute describes the next action that your customer needs to do. For example, this attribute holds the 3DS Authentication URL for thecard payment method, checkout URL for e-wallets, and other payment methods.

Attribute	Description
type string	The type of the next action to perform. The possible value is redirect for now.
redirect.url string	The URL you must redirect your customer to in order to authenticate the payment.
redirect.return_url string	If the customer does not abort the authentication process, they will be redirected to this URL after complete authentication.
payment_method_options dictionary
Specific configuration of the payment methods for the PaymentIntent.

Attribute	Description
card.request_three_d_secure string	This is the only current option for card payment method. Depending on the value, this option decides whether the card must require 3DS authentication or adjust depending on the default 3D Secure configuration of the card. Possible values are either any or automatic. any requires 3D Secure authentication if supported while automatic uses the default 3D Secure configuration of the card.
setup_future_usage dictionary
Creating a payment intent with this attribute would connect the payment to our card vaulting feature.

Attribute	Description
session_type	Describes the behavior of card vaulting. For now, the only possible value is on_session.
customer_id	The ID of the customer.
metadata dictionary
A set of key-value pairs that you can attach to the resource. This can be useful for storing additional information about the object in a structured format. Only string values are accepted.

created_at timestamp
The date when the PaymentIntent has been created.

updated_at timestamp
The date when the PaymentIntent has been updated.

Create a Payment Intent
const options = {
  method: 'POST',
  headers: {accept: 'application/json', 'content-type': 'application/json'},
  body: JSON.stringify({
    data: {
      attributes: {
        amount: 2000,
        payment_method_allowed: 'qrph, card, dob, paymaya, billease, gcash, grab_pay, shopee_pay',
        payment_method_options: {card: {request_three_d_secure: 'any'}},
        currency: 'PHP',
        capture_type: 'automatic'
      }
    }
  })
};

fetch('https://api.paymongo.com/v1/payment_intents', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


  Retrieve a Payment Intent
  const options = {method: 'GET', headers: {accept: 'application/json'}};

fetch('https://api.paymongo.com/v1/payment_intents/id', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));

  Attach to Payment Intent

  const options = {
  method: 'POST',
  headers: {accept: 'application/json', 'content-type': 'application/json'}
};

fetch('https://api.paymongo.com/v1/payment_intents/id/attach', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));

  Create a Payment Method
  const options = {
  method: 'POST',
  headers: {accept: 'application/json', 'Content-Type': 'application/json'}
};

fetch('https://api.paymongo.com/v1/payment_methods', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));

  Retrieve a Payment Method
const options = {method: 'GET', headers: {accept: 'application/json'}};

fetch('https://api.paymongo.com/v1/payment_methods/id', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


  Update a Payment Method
  const options = {
  method: 'PUT',
  headers: {accept: 'application/json', 'Content-Type': 'application/json'}
};

fetch('https://api.paymongo.com/v1/payment_methods/id', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


  Payment Resource
A Payment resource is an attempt by your customer to send you money in exchange for your product. This is a reference to an amount that you are expecting to receive if a payment resource with paid status becomes a part of a payout. If the payment status is failed, you can determine the reason for failure.

A Payment Resource
JSON

{
            "id": "pay_a1nn2DXxeooJ9JqQfj7ytxfe",
            "type": "payment",
            "attributes": {
                "amount": 10000,
                "billing": {
                    "address": {
                        "city": "Furview",
                        "country": "PH",
                        "line1": "111",
                        "line2": "Wanchan St",
                        "postal_code": "11111",
                        "state": "Metro Manila"
                    },
                    "email": "queue@flash.paymongo.net",
                    "name": "Zooey Doge",
                    "phone": "111-111-1111"
                },
                "currency": "PHP",
                "description": "Payment 1",
                "fee": 1850,
                "livemode": false,
                "net_amount": 8150,
                "payout": null,
                "source": {
                    "id": "tok_X925Gje9FzRxfZCiBzNaSCbE",
                    "type": "token"
                },
                "statement_descriptor": null,
                "status": "paid",
                "created_at": 1586093053,
                "paid_at": 1586093053,
                "updated_at": 1586093053
            }
        }
id string
Unique ID of the resource.

type string
Represents the resource type. Value is always payment.

amount integer
amount of the Payment. A positive integer with minimum amount of 2000. 2000 is the smallest unit in cents. If you want to receive an amount of 20.00, the value that you should pass is 2000. If you want to receive an amount of 1500.50, the value that you should pass is 150050. The amount is also considered as the gross amount.

billing dictionary

Attribute	Description
address.city string	City of the billing address information
address.country string	Country of the billing address information. Possible values are ISO 3166-1 alpha-2 codes or two-letter country codes..
address.line1 string	Line1 of the billing address information
address.line2 string	Line2 of the billing address information
address.postal_code string	Postal Code of the billing address information
address.state string	State of the billing address information
email string	E-mail address of the billing information.
name string	Name of the billing information.
phone string	Phone of the billing information.
currency string
Three-letter ISO currency code, in uppercase. PHP is the only supported currency as of the moment.

description string
Description of the payment.

fee integer
The PayMongo processing fee of the payment. A positive integer that is represented in cents. If the fee is 1500.50, the cent representation is 150050.

livemode boolean
The value is true if the resource exists in live mode or the value is false if the resource exists in test mode.

net_amount integer
The final amount that you will receive after PaytMongo deducted the fee. A positive integer that is represented in cents. If the net_amount is 1500.50, the cent representation is 150050.

payout dictionary
The Payout of the Payment resource. The value is null if the Payment is not yet a part of a Payout. If the Payout exists for the Payment, this means you will receive the net_amount of the Payment and this is sent to your nominated bank account. You may check the payout information for the status.

source dictionary
The payment method instrument used to create a payment.

Attribute	Description
id string	The id of the Source used to create the Payment.
type string	The type of the Source used to create the Payment. Possible values are source and token.
statement_descriptor string
You can use this value as the complete description that appears on your customers’ statements. Your account's business name is the default value if not passed.