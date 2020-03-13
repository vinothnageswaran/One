import { Given, Then } from "cypress-cucumber-preprocessor/steps";
import elements from "../../Pages/Home/Objects.json";
import Common from "../../Pages/Home/Common";
import { max } from "lodash";
import { waitforgetGeneration } from "../../Pages/Home/Database.js"

import moment from 'moment'
import promisify from 'cypress-promise'


let Scenarioidglobal;
let arrivaltimeglobal;
let datasetidglobal;
let portarrivaltimeformattedglobal;

Given('User select a rake and verifies sidebar labels and its values', async () => {

  Common.PSSD_Seed_runSQLfile("T001_Sidebar_PST");
  Common.PSS_Seed_runSQLfile("T001_Sidebar_PSS");

  cy.visit("/scheduling/deviation/dashboard");
  cy.viewport(2000, 1500)
  Common.importSchedule();

});



When("User click on the Rake", Sidebarl => {

  console.log(elements.Sidebar.Producttop);

  cy.wait(4000);

  let scenarioid;
  let datasetid;


  cy.get(elements.Dashboardobj.Rakearrivalpanel, { timeout: 20000 }) // It will wait until Rake arrival panel is visible for 20 sec
  Common.clickOnrake('20M0001A');

  cy
    .request({
      url: 'http://iorper-lstt01:9092/api/scenarios',
    })
    .then((resp) => {

      console.log(max(resp.body.map((s) => s.scenarioId)));

      scenarioid = max(resp.body.map((s) => s.scenarioId)); // Get the latest scenario id
      datasetid = max(resp.body.map((d) => d.dataSetId)); // Get the latest dataset id
      Scenarioidglobal = scenarioid;
      datasetidglobal = datasetid;


      console.log('scenarioid' + scenarioid, 'datasetid' + datasetid);


     


    })

})

Then("Sailtime is as expected", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.SailTime, texttobeverified: 'Sail Time' });

  /** To get Rake sail time **/


  cy.getSailtime(Scenarioidglobal);

  cy.get('@wsailtimeformatted').then((sailtimeformatted) => {
    console.log('sailtimeformatted fromcommand' + sailtimeformatted)
    cy.verifytext({ objecttobeverified: elements.Sidebar.SailTimev, texttobeverified: sailtimeformatted });
  })



})

Then("the sidebar is displayed", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Portarrival, texttobeverified: 'Port Arrival' });

})

Then("customer is customer1", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Customer, texttobeverified: 'Customer' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Custmernamev, texttobeverified: 'Customer 1' });


})

Then("Arrivaltime is as expected", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.ArrivalTime, texttobeverified: 'Arrival Time' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.ArrivalTimev, texttobeverified: arrivaltimeglobal });


})

Then("the product is MACF", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Producttop, texttobeverified: 'MACF' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Productbottom, texttobeverified: 'MACF' });


})

Then("SailBuffer is as NA", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.SailBuffer, texttobeverified: 'Sail Buffer' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.SailBufferv, texttobeverified: 'N/A' });


})

Then("the vessel details are TBN CAPE | 111111 |", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Vessel, texttobeverified: 'TBN CAPE' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.VesselDetails, texttobeverified: '111111 | LOA' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.VesselDetails, texttobeverified: '300m | Loading Order' });


})


Then("GLR Required is 7026 tonnes per hour", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Required, texttobeverified: 'Required' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Requiredv, texttobeverified: '7026 tph' });


})

Then("GLR current is 0 tonnes per hour", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Current, texttobeverified: 'Current' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Currentv, texttobeverified: '0 tph' });


})


Then("Unallocated tonnes is as expected", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.Unallocated, texttobeverified: 'Unallocated' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Unallocatedv, texttobeverified: '82.00kt /' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Unallocatedv, texttobeverified: '5 rakes' });


})


Then("Remaining tonnes is 100k", () => {


  cy.verifytext({ objecttobeverified: elements.Sidebar.Remaining, texttobeverified: 'Remaining' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Remainingv, texttobeverified: '100.00' });



})


Then("GLR product details are correct", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.GLR, texttobeverified: 'GLR' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.GLRONTARGET, texttobeverified: 'ON TARGET' });


  cy.verifytext({ objecttobeverified: elements.Sidebar.LoadingTarget, texttobeverified: 'Loaded / Target' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.LoadingTargetv, texttobeverified: '100kt (0)%' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.LoadingTargetv1, texttobeverified: '0.00kt /100.00kt' });


  cy.verifytext({ objecttobeverified: elements.Sidebar.Contracted, texttobeverified: 'Contracted' });
 


  cy.verifytext({ objecttobeverified: elements.Sidebar.Contracted, texttobeverified: ' Contracted(%)' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Contractedv, texttobeverified: '100kt (0)%' });



})

Then("Car dumper details are correct", () => {

  cy.verifytext({ objecttobeverified: elements.Sidebar.RequiredTimeToDumper, texttobeverified: 'Req' + "'" + 'd Time To Dumper' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.RakenameandTonnes, texttobeverified: '0001A' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.RakenameandTonnes, texttobeverified: '18,224' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Routetonnes, texttobeverified: '18kt' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.Routeduration, texttobeverified: '(120min)' });
  cy.verifytext({ objecttobeverified: elements.Sidebar.AllocationsBerth, texttobeverified: 'A' });



})


Then("Required time to dumper is as expected", () => {

  /** To get required time to dumper**/

  cy.getRequiredtimetodumper(Scenarioidglobal, datasetidglobal);

  cy.get('@wrequiredtimetodumper').then((requiredtimetodumperformatted) => {
    console.log('requiredtimetodumperformatted' + requiredtimetodumperformatted)
    // cy.verifytext({ objecttobeverified: elements.Sidebar.RequiredTimeToDumperv, texttobeverified: requiredtimetodumperformatted });
  })




})


Then("the product quality details are as expected", () => {

  /** To get grades */

  cy
    .request({
      url: 'http://iorper-lstt01:9092/api/Port/' + datasetidglobal,
    })
    .then((resp) => {

      let Al2o3;
      let Fev;
      let H2o;
      let P;
      let Sio2;

      /** To get grades */
      let grades = max(resp.body.rakes.map((g) => g.grades));
      Al2o3 = grades[0].gradeValue.toString();
      Fev = grades[1].gradeValue.toString();
      H2o = grades[2].gradeValue.toString();
      P = grades[3].gradeValue.toString();
      Sio2 = grades[4].gradeValue.toString();

      let events = max(resp.body.nominations.map((e) => e.events));
      let Arr = events[0].eventTime.toString();

      let arrivaltime = moment(Arr).format('Do MMM, HH:mm');

      arrivaltimeglobal = arrivaltime;

      /** To get Rake arrival time **/

      let portArrivalTime = max(resp.body.rakes.map((p) => p.portArrivalTime));

      //let portarrivaltime = grades.portArrivalTime;
      let portarrivaltimeformatted = moment(portArrivalTime).format('Do MMM, HH:mm');
      portarrivaltimeformattedglobal = portarrivaltimeformatted;

      console.log('portArrivalTime  ' + portArrivalTime);
      console.log('arrivaltime  ' + arrivaltime);
      console.log(Al2o3, Fev, H2o, P, Sio2);


      /* Assertsions */

      cy.verifytext({ objecttobeverified: elements.Sidebar.Fe, texttobeverified: 'Fe' });
      cy.verifytext({ objecttobeverified: elements.Sidebar.Fev, texttobeverified: Fev });
      cy.verifytext({ objecttobeverified: elements.Sidebar.Fe, texttobeverified: 'Fe %' });

      cy.verifytext({ objecttobeverified: elements.Sidebar.Al2o3, texttobeverified: 'Al' });
      cy.verifytext({ objecttobeverified: elements.Sidebar.Al2o3v, texttobeverified: Al2o3 });
      cy.verifytext({ objecttobeverified: elements.Sidebar.Sio2, texttobeverified: 'SiO' });
      cy.verifytext({ objecttobeverified: elements.Sidebar.Sio2v, texttobeverified: Sio2 });
      cy.verifytext({ objecttobeverified: elements.Sidebar.H2o, texttobeverified: 'H' });
      cy.verifytext({ objecttobeverified: elements.Sidebar.H2ov, texttobeverified: H2o });
      cy.verifytext({ objecttobeverified: elements.Sidebar.P, texttobeverified: 'P' });
      cy.verifytext({ objecttobeverified: elements.Sidebar.Pv, texttobeverified: P });

    })

  })

  Then("Scheduled dump time is as expected", () => {
    cy.getRequiredtimetodumper(Scenarioidglobal, datasetidglobal);
    cy.verifytext({ objecttobeverified: elements.Sidebar.Allocations, texttobeverified: 'Allocations' });

    cy.get('@wscheduleddumptimevalue').then((scheduleddumptimevalue) => {
      console.log('scheduleddumptimevalue' + scheduleddumptimevalue)
      cy.verifytext({ objecttobeverified: elements.Sidebar.ScheduledDumpTimev, texttobeverified: scheduleddumptimevalue });
    })

    cy.verifytext({ objecttobeverified: elements.Sidebar.ScheduledDumpTime, texttobeverified: 'Scheduled Dump Time' });


  })



  Then("the Portarrival time is correct", () => {
    cy.verifytext({ objecttobeverified: elements.Sidebar.Portarrival, texttobeverified: 'Port Arrival' });
    cy.verifytext({ objecttobeverified: elements.Sidebar.Portarrivalv, texttobeverified: portarrivaltimeformattedglobal });

  })

  Then("Allocated tone is 7026tph", () => {

    cy.verifytext({ objecttobeverified: elements.Sidebar.CurrentLocation, texttobeverified: 'Current Location' });
     
    cy.verifytext({ objecttobeverified: elements.Sidebar.ProductQaulitty, texttobeverified: 'Product Quality' });
    cy.verifytext({ objecttobeverified: elements.Sidebar.Allocated, texttobeverified: 'Allocated' });
    cy.verifytext({ objecttobeverified: elements.Sidebar.Allocatedv, texttobeverified: '7026 tph' });

  })

  

  Then("Projected Quality is ON SPEC", () => {

    cy.verifytext({ objecttobeverified: elements.Sidebar.ProjectedQuality, texttobeverified: 'Projected Quality' });
    cy.verifytext({ objecttobeverified: elements.Sidebar.ProjectedQuality_ONSPEC, texttobeverified: 'ON SPEC' });

  })



