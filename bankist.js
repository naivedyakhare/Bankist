'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2021-04-15T23:36:17.929Z',
    '2021-04-22T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2021-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

accounts.forEach(acc => {
  acc.movementsAndDates = acc.movements.map((mov, i) => [mov, acc.movementsDates[i]])
})

/////////////////////////////////////////////////
//   GLOBAL -- VARIABLES -- HERE   \\

let currentAccount;
let totalBalance = 0;
let transferBalance = 0;
let receiveBalance = 0;
let interestBalance = 0;
let totalTransactions = 0;
let sortBy;
let todaysDate;
let timeoutGlobal;

/////////////////////////////////////////////////
/////////////////////////////////////////////////
///   TIMER -- HERE   \\\
const startCountDown = function() {
  timeoutGlobal = 300;
  const timer = () => {
    let minutes = 0;
    let seconds = timeoutGlobal;
    timeoutGlobal -= 1;
    minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;  
    
    if(timeoutGlobal <= -1){
      containerApp.style.opacity = '0'; //DISPLAY INTERFACE
      currentAccount = null; //SET CURRENT ACCOUNT TO NULL
      labelWelcome.textContent = `Log in to get started`;
      inputNull();
      clearInterval(countDown);
    }
  labelTimer.textContent = `${minutes}`.padStart(2,0)+':'+`${seconds}`.padStart(2, 0);
  }
  timer();
  const countDown = setInterval(timer, 1000);
  return countDown;
}

///   CREATE -- USERNAME   \\\
const createUsername = function(account) {
  account.username = account.owner.split(' ').map(name => name[0]).join('').toLowerCase();
}
accounts.forEach(account => createUsername(account)); //CREATING USERNAME FOR EACH ACCOUNT

const inputNull = function() {
  inputLoginUsername.value = null;
  inputLoginPin.value = null;
  inputTransferTo.value = null;
  inputTransferAmount.value = null;
  inputLoanAmount.value = null;
  inputCloseUsername.value = null;
  inputClosePin.value = null;
}
//////////////////////////////////////////////////////////
//   DISPLAYING -- MOVEMENT -- ON -- THE -- LEFT -- TAB   \\
const formatCurrency = function(acc, mov) {
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency
  }).format(mov);
}

const compareDate = (date1, date2) => {
  date2 = new Date(date2);
  const date3 = new Date(date2).getTime();

  const difference = Math.round((date1 - date3)/(1000*60*60*24));

  if(difference === 0) return `Today`;
  else if(difference == 1) return `Yesterday`;
  else if(difference > 1 && difference < 7) return `${difference} days ago`;
  else if(difference >= 7 && difference < 14) return `1 Week ago`
  
  let returnTime = String(new Intl.DateTimeFormat(currentAccount.locale).format(date2));
  return returnTime.split('/').map(type => type.padStart(2, 0)).join('/');
  //Above line adds 0 on a single digit date.
}
const displayMovement = function([mov, movDate]) {  
  //index is 0 for Movement, 1 for Date
    const type = mov > 0 ? 'deposit': 'withdrawal';
    totalTransactions++;
    const thisDate = compareDate(todaysDate, movDate);

    //SETS CURRENCY FOR RESPECTIVE USERS
    const movFormat = formatCurrency(currentAccount, mov);

    //   CREATING HTML ROW FOR DISPLAING ON LEFT TAB   \\
    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${totalTransactions} ${type.toUpperCase()}</div>
    <div class="movements__date">${thisDate}</div>
    <div class="movements__value">${movFormat}</div>
    </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);

}

const displayLabel = function (acc) {
  labelBalance.textContent = formatCurrency(acc, totalBalance);
  labelSumIn.textContent = formatCurrency(acc, receiveBalance);
  labelSumOut.textContent = formatCurrency(acc, Math.abs(transferBalance));
  labelSumInterest.textContent = formatCurrency(acc, interestBalance);
}

const calcBalance2 = function(acc) {

  totalBalance = 0;
  transferBalance = 0;
  receiveBalance = 0;
  totalTransactions = 0;
  interestBalance = 0;
  containerMovements.innerHTML = '';

  acc.movementsAndDates.forEach(movIterate => {
    movIterate[0] < 0 ? transferBalance += Math.abs(movIterate[0]) : receiveBalance += movIterate[0];  
    totalBalance += movIterate[0]; 
    interestBalance += movIterate[0] > 0 ? (movIterate[0] * currentAccount.interestRate) / 100 : 0; 

    displayMovement([...movIterate]);
  });
  displayLabel(acc);
}

const calcBalance = function (mov, movDate) {
  if(mov) {
    currentAccount.movementsAndDates.push([mov, movDate]); //ADDING TIME IN THE movementDates.  
    mov < 0 ? transferBalance += Math.abs(mov) : receiveBalance += mov;  
    totalBalance += mov; 
    interestBalance += mov > 0 ? (mov * currentAccount.interestRate) / 100 : 0; 
    
    displayMovement([mov, movDate])
  }
  if(!mov) { calcBalance2(currentAccount) }
  displayLabel(currentAccount);
}

////////////////////////////////
//   LOAD -- THE -- ACCOUNT   \\
let countDown;
const loadCurrentAccount = function() {
  ///   To -- initialise -- the account   \\\
  (function() {
    labelWelcome.textContent = `Welcome, ${currentAccount.owner.split(' ')[0]}`  //Display Welcome Message.
    
    todaysDate = new Date();
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(todaysDate);
    sortBy = 'Date';

    inputNull();
    calcBalance();    
    if(countDown != null) clearInterval(countDown);
    countDown = startCountDown();
  })()
}

//   USER--LOGIN--HERE   \\
const userLogin = function(e) {
  e.preventDefault();

  const username = inputLoginUsername.value;
  const PIN = +(inputLoginPin.value);

  const acc = accounts.find(acc => username == acc.username && PIN == acc.pin);
  if(acc) {
    containerApp.style.opacity = '1'; //DISPLAY UI  
    currentAccount = acc; //SET CURRENT ACCOUNT
    loadCurrentAccount();
  }
}

//   TRANSFER--MONEY--HERE   \\
const transferMoney = function(e) {
  e.preventDefault();

  const transferTo = inputTransferTo.value;
  const transferAmount = +(inputTransferAmount.value);

  const acc = accounts.find(acc => transferTo != currentAccount.username && transferTo == acc.username)
  if(acc) {
    const movDate = new Date().toISOString();

    acc.movementsAndDates.push([transferAmount, movDate]);
    currentAccount.movementsAndDates.push([-transferAmount, movDate]);
    calcBalance(-transferAmount, movDate);
    inputNull();
  }
}

//   GET--LOAN--HERE   \\
const loanRequest = function(e) {
  e.preventDefault();

  const loanAmount = +inputLoanAmount.value;

  if(currentAccount.movements.some(mov => mov > 0) && loanAmount/10 <= totalBalance) {
    setTimeout(() =>{
      const curMov = [+loanAmount.toFixed(0), new Date().toISOString()];
      currentAccount.movements.push([+loanAmount.toFixed(0), curMov]);
      calcBalance(...curMov);
  }, 5000);
  inputNull();
  }
}

//   CLOSE -- ACCOUNT -- HERE \\
const closeAccount = function(e) {
  e.preventDefault();

  const username = inputCloseUsername.value;
  const PIN = inputClosePin.value;

  if(username == currentAccount.username && PIN == currentAccount.pin) {    
    accounts.splice(accounts.findIndex(acc => acc.username == currentAccount.username), 1);
    timeoutGlobal = 0; //Deletes account and sets timer = 0 so UI disappears.
  }
}  

//   SORT -- MOVEMENTS -- HERE   \\
const sortMovements = function() {
  const tempAccObj = { 
    movementsAndDates: currentAccount.movementsAndDates.slice(),
    locale: currentAccount.locale,
    currency: currentAccount.currency
  };

  if(sortBy == 'Date') {
    tempAccObj.movementsAndDates.sort((a, b)=> a[0] - b[0]); 
    sortBy = 'Balance';
  } else {
    //SORT BY DATE, LATER
    sortBy = 'Date';
  }
  calcBalance2(tempAccObj);
} 

//   EVENT LISTENERS -- HERE   \\
btnLogin.addEventListener('click', userLogin);
btnTransfer.addEventListener('click', transferMoney);
btnLoan.addEventListener('click', loanRequest);
btnClose.addEventListener('click', closeAccount);
btnSort.addEventListener('click', sortMovements);
