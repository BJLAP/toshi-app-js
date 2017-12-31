const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  welcome(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'identify':
      identify(session)
      break
    case 'loan':
      loan(session)
      break
    case 'repay':
      repay(session)
      break
    case 'donate':
      donate(session)
      break
    case 'eth':
      payEth(session)
      break
    case 'usd':
      payUsd(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `Hi, this is MicroLoans. How can I help you?`)
}


// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function loan(session) {
  askForLoanDetails(session)
}

function identify(session) {
  identifyCustomer(session);
}

function repay(session) {
   let loanType = session.get('loan')
   if (loanType == 'ETH1') {
     repayEth(session)
   } else if (loanType == 'USD10') {
     repayUsd(session)
   }
   else if (loanType == 'USD10') {
    repayUsd(session)
   }
   else  {
    sendMessageDonate(session)
   }

   session.set('loan', 'None')
}

function donate(session) {
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(5), "Donation (USD 5)")
  })
}

function payEth(session) {
  session.sendEth(1, function(session, error, result) {
    console.log(error)
  })
  session.set('loan', 'ETH1')
  sendMessageNoButtons(session, "ETH 1 sent.")
}

function payUsd(session) {
  Fiat.fetch().then((toEth) => {
    session.sendEth(toEth.USD(10))
  })
  session.set('loan', 'USD10')
  sendMessageNoButtons(session, "USD 10 sent.")
}

function repayEth(session) {
  session.requestEth(1, "Repayment loan (ETH 1.00)");
}

function repayUsd(session) {
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(10), "Repayment loan (USD 10.00)")
  })
}

// HELPERS

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Request Loan', value: 'identify'},
    {type: 'button', label: 'Make Repayment', value: 'repay'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageDonate(session) {
  let controls = [
    {type: 'button', label: 'Donate', value: 'donate'}
  ]
  session.reply(SOFA.Message({
    body: "No loans to repay, do you want to donate USD 5?",
    controls: controls,
    showKeyboard: false,
  }))
}

function sendMessageNoButtons(session, message) {
  session.reply(SOFA.Message({
    body: message,
    showKeyboard: false,
  }))
}

function identifyCustomer(session) {
  let controls = [
    {type: 'button', label: 'Identify yourself  please', action: "Webview::http://www.deeskerhof.nl/dapp.html"},
    {type: 'button', label: 'request loan', value: 'loan' }
    
  ]
  session.reply(SOFA.Message({
    body: "Identify and press loan button",
    controls: controls,
    showKeyboard: false,
  }))
}

function askForLoanDetails(session) {
  let controls = [
    {type: 'button', label: 'USD 10.00', value: 'usd'},
    {type: 'button', label: 'ETH 1.00', value: 'eth'}
  ]
  session.reply(SOFA.Message({
    body: "Select a loan:",
    controls: controls,
    showKeyboard: false,
  }))
}

