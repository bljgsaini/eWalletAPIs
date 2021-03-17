Promise = require('bluebird');
const { port } = require('./vars');
const app = require('./express');
const mongoose = require('./mongoose');
const Customer = require('../services/customerService');
const paymentService = require('../services/paymentService');
const withdrawalService = require('../services/withdrawalService');
const transferService = require('../services/transferService');

// open mongoose connection
mongoose.connect();

app.route("/getBalance")
  .get(function (req, res) {
    try {
      req.query.customerId = req.customer.customerId;
      const customer = await Customer.find(req.query.customerId);
      const balance = customer.balance;
      res.json(balance);
    } catch (error) {
      next(error);
    }
  });

app.route("/getTransactions")
  .get(function (req, res) {
    try {
      req.query.accountNumber = req.customer.accountNumber;
      const transactions = await Transaction.list(req.query);
      const transformedTransactions = transactions.map(transaction => transaction.transform());
      res.json(transformedTransactions);
    } catch (error) {
      next(error);
    }
  });

app.route("/deposit")
  .post(function (req, res) {
    try {
      const paymentResponse = await paymentService.makePayment(req.customer.accountNumber, req.body.card, req.body.amount);        
      res.json(paymentResponse);    
      
    } catch (error) {
      next(error);
    }
  });

app.route("/transfer")
  .post(function (req, res) {
    try {    
      const transferResponse = await transferService.transfer(req.customer.accountNumber, req.body.amount, req.body.destinationAccountNumber);    
      res.json(transferResponse);    
      
    } catch (error) {
      next(error);
    }
  });

app.route("/withdrawal")
  .post(function (req, res) {
    try {
      const withdrawalResponse = await withdrawalService.withdrawal(req.customer.accountNumber, req.body.card, req.body.amount);        
      res.json(withdrawalResponse);    
      
    } catch (error) {
      next(error);
    }
  });


// listen to requests
app.listen(port, () => console.info(`server started on port ${port}`));
