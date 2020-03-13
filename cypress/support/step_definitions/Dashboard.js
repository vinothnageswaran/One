import { Given,Then} from "cypress-cucumber-preprocessor/steps";
import elements from "../../Pages/Home/Objects.json";
import Common from "../../Pages/Home/Common";


Given('User navigates to Deviation Management Dashboard', async () => {
 
  cy.visit("/scheduling/deviation/dashboard");
  cy.viewport(2000,1500)

  
 });

 
 Then("The top panel has {string}", site => {

  Common.Veriftext(elements.Dashboardobj.Yard,site);

 
 });

 Then ("the {string} appears in top panel", equip=>{

  Common.Veriftext(elements.Dashboardobj.Equipment,equip);


 });

 Then ("the {string} appears on top right", dashb=>{

  Common.Veriftext(elements.Dashboardobj.db,dashb);


 });


 Then ("the {string} button appears on top right", saveb=>{

  Common.Veriftext(elements.Dashboardobj.Save,saveb);


 });


 Then ("the {string} button appears on top right corner", auxiliaryeb=>{

  Common.Veriftext(elements.Dashboardobj.Auxiliary,auxiliaryeb);

  

 });

 Then ("the North Yard button appears as {string}", NYb=>{

  Common.Veriftext(elements.Dashboardobj.NY,NYb);

 });

 Then ("the South Yard button appears as {string}", SYb=>{

  Common.Veriftext(elements.Dashboardobj.SY,SYb);

 });

 Then ("the East Yard button appears as {string}", EYb=>{

  Common.Veriftext(elements.Dashboardobj.EY,EYb);

 });

 Then ("the West Yard button appears as {string}", WYb=>{

  Common.Veriftext(elements.Dashboardobj.WY,WYb);

 });

 Then ("the {string} panel appears on top left", RakeArrivalb=>{

  cy.wait(3000);

  Common.Veriftext(elements.Dashboardobj.Rakearrivalpanel,RakeArrivalb);

 });


 Then ("the {string} panel appears on the top as an item 2", StabledRakesb=>{

  cy.wait(3000);

  Common.Veriftext(elements.Dashboardobj.StabledRakes,StabledRakesb);

 });

 Then ("the {string} panel appears  on the top as an item 3", SPAAllocationb=>{

  cy.wait(3000);

  Common.Veriftext(elements.Dashboardobj.SPAAllocation,SPAAllocationb);
 

 });

 Then ("the {string} panel appears  on the top as an item 4", Tideb=>{

  cy.wait(3000);

  cy.get(elements.Dashboardobj.Tide).invoke('text').then((text1) => {
   console.log(text1);
    })
 

  Common.Veriftext(elements.Dashboardobj.Tide,Tideb);

 });

 Then ("Select Rake ER-0001A and Verify Rake title on side bar is {string}", Raket=>{

     cy.wait(5000)
     cy.window().then((win) => {   
     const rakeItem = win['timeline_container_0_data'].find(x => x.id === "20M0001A");
     cy.get("#timeline_container_0 > canvas")
     .wait(2000)
     .click(rakeItem.position.x+1, rakeItem.position.y+1);
     console.log(rakeItem);
  })



 })


 

 






 