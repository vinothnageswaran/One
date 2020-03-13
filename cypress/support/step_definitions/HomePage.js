import { Given } from "cypress-cucumber-preprocessor/steps";
import LandingPage from "../../Pages/Home/LandingPage";
import Common from "../../Pages/Home/Common";


const sql = require('mssql');

const sqlscripts =require('./Sqlscripts.json');

const url = 'http://iorper-lstt01:9092/port/#/port';
Given('I open MES Portal', async () => {
   LandingPage.visit();

});


When('I Click on Weekly', async () => {
  LandingPage.pressWeeklyButton();
  cy.task("getTides", "100").then(tides => {
   cy.log(tides);

  });
  

});


Then('I see "Events"', async () => {
  LandingPage.VerifyEvents("Events");
 Common.PSS_runSQLfile("sqldata");

});



