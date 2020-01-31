import { Given,Then} from "cypress-cucumber-preprocessor/steps";
import elements from "../../Pages/Home/Objects.json";
import Common from "../../Pages/Home/Common";

Given('User navigates to Deviation Management Dashboard', async () => {
 
  cy.visit("/scheduling/deviation/dashboard");
  cy.viewport(2000,1500)
 
 });

 
 Then("The top panel has {string}", site => {

  Common.Veriftext(elements.Dashboardobj.Yard,site)
 
 });

 Then ("the {string} appears in top panel", equip=>{

  Common.Veriftext(elements.Dashboardobj.Equipment,equip)


 });

 Then ("the {string} appears on top right", dashb=>{

  Common.Veriftext(elements.Dashboardobj.db,dashb)


 });


 Then ("the {string} button appears on top right", saveb=>{

  Common.Veriftext(elements.Dashboardobj.Save,saveb)


 });


 