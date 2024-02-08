/*
 * Copyright (C) 2022 - 2023 Partisia Blockchain Foundation
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import {
  getAverageApi,
  isConnected,
  setContractAbi,
  setContractAddress,
  setEngineKeys,
} from "./AppState";
import { 
  connectMpcWalletClick,
  disconnectWalletClick,
  updateContractState,
  updateInteractionVisibility,
} from "./WalletIntegration";




// Setup event listener to connect to the MPC wallet browser extension
const connectWallet = <Element>document.querySelector("#wallet-connect-btn");
connectWallet.addEventListener("click", connectMpcWalletClick);


// Setup event listener to connect to the MetaMask snap
//const pkConnect = <Element>document.querySelector("#private-key-connect-btn");
//pkConnect.addEventListener("click", connectPrivateKeyWalletClick);

// Setup event listener to drop the connection again
const disconnectWallet = <Element>document.querySelector("#wallet-disconnect-btn");
disconnectWallet.addEventListener("click", disconnectWalletClick);

// Setup event listener that sends a transfer transaction to the contract.
// This requires that a wallet has been connected.
// const addSalarySubmitBtn = <Element>document.querySelector("#add-salary-btn");
// addSalarySubmitBtn.addEventListener("click", addSalaryFormAction);

// const computeSalaryBtn = <Element>document.querySelector("#compute-average-salary-btn");
// computeSalaryBtn.addEventListener("click", computeAction);

const addressBtn = <Element>document.querySelector("#address-btn");
addressBtn.addEventListener("click", contractAddressClick);

const ratingBtn = <Element>document.querySelector("#rating-btn");
ratingBtn.addEventListener("click", ratingClick);

const surveyBtn = <Element>document.querySelector("#surveyid-btn");
surveyBtn.addEventListener("click", fetchSurvey);

const updateStateBtn = <Element>document.querySelector("#update-state-btn");
updateStateBtn.addEventListener("click", updateContractState);

/** Function for the contract address form.
 * This is called when the user clicks on the connect to contract button.
 * It validates the address, and then gets the state for the contract.
 */
function contractAddressClick() {
  //alert('test'); return;
  const address = (<HTMLInputElement>document.querySelector("#address-value")).value;
  const regex = /[0-9A-Fa-f]{42}/g;
  if (address === undefined) {
    throw new Error("Need to provide a contract address");
  } else if (address.length != 42 || address.match(regex) == null) {
    // Validate that address is 21 bytes in hexidecimal format
    console.error(`${address} is not a valid PBC address`);
  } else {
    // Show address and a link to the browser.
    const currentAddress = <HTMLInputElement>document.querySelector("#current-address");
    currentAddress.innerHTML = `Smart Contract Address: ${address}`;
    const browserLink = <HTMLInputElement>document.querySelector("#browser-link");
    browserLink.innerHTML = `<a href="https://browser.testnet.partisiablockchain.com/contracts/${address}" target="_blank">Browser link</a>`;

    // Reset abi and engine keys
    setContractAbi(undefined);
    setEngineKeys(undefined);
    // Update the contract state.
    setContractAddress(address);
    updateInteractionVisibility();
    //updateContractState();
  }
}

function ratingClick(){

  console.log('clicked', isConnected());
  
  if (isConnected()) {
    const rating = <HTMLInputElement>document.querySelector("#rating-value");
    if (isNaN(parseInt(rating.value, 10))) {
      // Validate that amount is a number
      console.error("Salary must be a number");
    } else {

      console.log('clicked', isConnected(),rating.value);
      // All fields validated, add salary.

      // If the user has inputted a correct average salary address this should be defined.
      const api = getAverageApi();

      if (api !== undefined) {
        // Add salary via Average Salary api
        const browserLink = <HTMLInputElement>(
          document.querySelector("#add-rating-transaction-link")
        );
        browserLink.innerHTML = '<br><div class="loader"></div>';
        api
          .addRating(parseInt(rating.value, 10))
          .then((transactionHash) => {
            browserLink.innerHTML = `<br><a href="https://browser.testnet.partisiablockchain.com/transactions/${transactionHash}" target="_blank">Transaction link in browser</a>`;
          })
          .catch((msg) => {
            browserLink.innerHTML = `<br>${msg}`;
          });
      }

    }

  }

}

interface Payload {
  key: string;
  eventcode: string;
  id: number
}

async function fetchSurvey () {
  try {
    let surveyid=0;
    if (isConnected()) {
       let inputE =<HTMLInputElement>document.querySelector("#surveyid-value");
       surveyid=parseInt(inputE.value, 10);
    }else{
      alert('Pls login using wallet extension');
      return;
    }

    // Define payload with the correct type
    let payload: Payload = {
      key: '75dd3300-6f8f-11ec-803e-b9f5a1eecc46',
      eventcode: 'KCEV'+surveyid,
      id: surveyid 
    };

    //alert(payload); return;

    // Make a POST request to your remote API
    const response = await fetch('https://crowdsnap.ai/api/polls/getpubliceventbyid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload) // Corrected
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    
    // Parse the JSON response
    const jsonData = await response.json();
    console.log(jsonData, jsonData.survey, jsonData.survey.survey.length);
    if(jsonData && jsonData.survey && jsonData.survey.survey && jsonData.survey.survey.length > 0){
       let poll = jsonData.survey.survey[0];
      
       const statusText = document.querySelector("#p_poll_q");
       console.log(poll, statusText);
  if (statusText != null) {
    statusText.innerHTML = poll.question;
  }
    }

    // Update state with the fetched data
    // setData(jsonData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


/** Action for the compute average salary button */
function computeAction() {
  // User is connected and the Average Salary Api is defined
  const api = getAverageApi();
  const browserLink = <HTMLInputElement>document.querySelector("#compute-transaction-link");
  browserLink.innerHTML = '<br><div class="loader"></div>';
  if (isConnected() && api !== undefined) {
    // Call compute via the Api
    api
      .compute()
      .then((transactionHash) => {
        browserLink.innerHTML = `<br><a href="https://browser.testnet.partisiablockchain.com/transactions/${transactionHash}" target="_blank">Transaction link in browser</a>`;
      })
      .catch((msg) => {
        browserLink.innerHTML = `<br>${msg}`;
      });
  }
}

// Add this line to make the function globally accessible
// (window as any).submitRating = submitRating;
// (window as any).setContract = setContract;

// // Call setContract when the body loads
// document.body.onload = setContract;

// function setContract(): void{
 
//  let address = '';
//  // Reset abi and engine keys
//  setContractAbi(undefined);
//  setEngineKeys(undefined);
//  // Update the contract state.
//  setContractAddress(address);
//  updateInteractionVisibility();
//  updateContractState();
// }

// function submitRating(rating: number): void {
//   console.log('Submitted rating:', rating);
//   resetStars();
// }

// function resetStars(): void {
//   const stars = document.querySelectorAll('.fa-star');
//   stars.forEach(star => star.classList.remove('active'));
// }

// Add an event listener for the star rating
// document.addEventListener('click', function(event) {
//   // Check if the clicked element has the 'star' class
//   if ((event.target as Element).classList.contains('fa-star')) {
//     // Extract the rating from the data attribute or any other method you use
//     const rating = parseInt((event.target as Element).getAttribute('data-rating') || '0', 10);
//     // Call the submitRating function with the extracted rating
//     submitRating(rating);
//   }
// });